import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, OnDestroy, Input, OnChanges } from '@angular/core';

import {LayerManager, Layer} from 'deck.gl/dist-es6/lib';
import {EffectManager, Effect} from 'deck.gl/dist-es6/experimental';
import {GL, addEvents} from 'luma.gl';
import {Viewport, WebMercatorViewport} from 'deck.gl/dist-es6/lib/viewports';
import {log} from 'deck.gl/dist-es6/lib/utils';

@Component({
  selector: 'ri-ng-deck',
  templateUrl: './ng-deck.component.html',
  styleUrls: ['./ng-deck.component.css']
})
export class NgDeckComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('content') content: ElementRef;

  @Input() id: String = 'deckgl-overlay';
  @Input() layers: Layer[];
  @Input() effects: Effect[] = [];
  @Input() gl: any = null;
  @Input() debug: Boolean = false;
  @Input() viewport: Viewport;

  @Input() width: number;
  @Input() height: number;
  @Input() longitude: any;
  @Input() latitude: any;
  @Input() zoom: any;
  @Input() minZoom: any;
  @Input() maxZoom: any;
  @Input() pitch: any;
  @Input() bearing: any;

  @Output() onWebGLInitialized: EventEmitter<any> = new EventEmitter();
  @Output() onLayerClick: EventEmitter<any> = new EventEmitter();
  @Output() onLayerHover: EventEmitter<any> = new EventEmitter();
  @Output() onAfterRender: EventEmitter<any> = new EventEmitter();

  private state: any = {};
  private needsRedraw: Boolean = true;
  private layerManager: any = null;
  private effectManager: any = null;
  private events: any;

  constructor() { }

  ngOnInit() {
    if (null == this.viewport && (null == this.width || null == this.height)) {
      throw new Error('Attribute \'viewport\' or \'height\' and \'width\' is required');
    }
    if (null == this.layers) {
      throw new Error('Attribute \'layers\' is required');
    }
    // const gl = this.content.nativeElement.getContext('webgl');
    // this.layerManager = new LayerManager({ gl: gl });

    // const viewport = new Viewport({width: 500, height: 500});
    // console.log(this.layerManager, this.content);
    // this.layerManager.setViewport(viewport);
  }

  ngOnDestroy() {

  }

  ngOnChanges(nextProps) {
    this._updateLayers(this);
  }

  _updateLayers(nextProps) {
    const {width, height, latitude, longitude, zoom, pitch, bearing, altitude} = nextProps;
    let {viewport} = nextProps;

    // If Viewport is not supplied, create one from mercator props
    viewport = viewport || new WebMercatorViewport({
      width, height, latitude, longitude, zoom, pitch, bearing, altitude
    });

    if (this.layerManager) {
      this.layerManager
        .setViewport(viewport)
        .updateLayers({newLayers: nextProps.layers});
    }
  }

  _onRendererInitialized({canvas, gl}) {
    gl.enable(GL.BLEND);
    gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

    this.onWebGLInitialized.emit(gl);

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager({gl});
    this.effectManager = new EffectManager({gl, layerManager: this.layerManager});
    for (const effect of this.effects) {
      this.effectManager.addEffect(effect);
    }
    this._updateLayers(this);

    this.events = addEvents(canvas, {
      cacheSize: false,
      cachePosition: false,
      centerOrigin: false,
      onClick: this._onClick.bind(this),
      onMouseMove: this._onMouseMove.bind(this)
    });
  }

  // Route events to layers
  _onClick(event) {
    // use offsetX|Y for relative position to the container, drop event if falsy
    if (!event || !event.event || !Number.isFinite(event.event.offsetX)) {
      return;
    }
    const {event: {offsetX: x, offsetY: y}} = event;
    const selectedInfos = this.layerManager.pickLayer({x, y, mode: 'click'});
    if (selectedInfos.length) {
      const firstInfo = selectedInfos.find(info => info.index >= 0);
      // Event.event holds the original MouseEvent object
      this.onLayerClick.emit([firstInfo, selectedInfos, event.event]);
    }
  }

  // Route events to layers
  _onMouseMove(event) {
    if (!event || !event.event || !Number.isFinite(event.event.offsetX)) {
      return;
    }
    const {event: {offsetX: x, offsetY: y}} = event;
    const selectedInfos = this.layerManager.pickLayer({x, y, mode: 'hover'});
    if (selectedInfos.length) {
      const firstInfo = selectedInfos.find(info => info.index >= 0);
      // Event.event holds the original MouseEvent object
      this.onLayerHover.emit([firstInfo, selectedInfos, event.event]);
    }
  }

  _onRenderFrame({gl}) {
    const redraw = this.layerManager.needsRedraw({clearRedrawFlags: true});
    if (!redraw) {
      return;
    }

    // clear depth and color buffers
    gl.clear(GL.COLOR_BUFFER_BIT || GL.DEPTH_BUFFER_BIT);

    this.effectManager.preDraw();
    this.layerManager.drawLayers({pass: 'primary'});
    this.effectManager.draw();
  }

}
