import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Output, Input, EventEmitter } from '@angular/core';

import {LayerManager, Layer} from 'deck.gl/dist-es6/lib';
import {EffectManager, Effect} from 'deck.gl/dist-es6/experimental';
import {GL, addEvents} from 'luma.gl';
import {Viewport, WebMercatorViewport} from 'deck.gl/dist-es6/lib/viewports';
import {log} from 'deck.gl/dist-es6/lib/utils';
import {createGLContext} from 'luma.gl';

@Component({
  selector: 'ri-webgl-renderer',
  templateUrl: './webgl-renderer.component.html',
  styleUrls: ['./webgl-renderer.component.css']
})
export class WebglRendererComponent implements OnInit, OnDestroy {
  @ViewChild('overlay') overlay: ElementRef;

  @Input() id: string;
  @Input() width: number;
  @Input() height: number;
  @Input() viewport: any;

  @Input() style: any = {};
  @Input() pixelRatio: number = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  @Input() events: any;
  @Input() gl: any = null;
  @Input() glOptions: any = { preserveDrawingBuffer: true };
  @Input() debug: Boolean = false;
  @Input() state: any = {};

  @Output() onInitializationFailed: EventEmitter<any> = new EventEmitter();
  @Output() onRendererInitialized: EventEmitter<any> = new EventEmitter();
  @Output() onRenderFrame: EventEmitter<any> = new EventEmitter();
  @Output() onMouseMove: EventEmitter<any> = new EventEmitter();
  @Output() onClick: EventEmitter<any> = new EventEmitter();
  @Output() onAfterRender: EventEmitter<any> = new EventEmitter();

  private x: Number;
  private y: Number;
  private w: Number;
  private h: Number;
  private _animationFrame: any = null;

  private layerManager;

  constructor() { }

  ngOnInit() {
    if (null == this.id) {
      throw new Error('Attribute \'id\' is required');
    }
    if (null == this.viewport && (null == this.width || null == this.height)) {
      throw new Error('Attribute \'viewport\' or \'height\' and \'width\' is required');
    }

    const canvas = this.overlay.nativeElement;
    this._initWebGL(canvas);
    this._animationLoop();

    // const gl = this.content.nativeElement.getContext('webgl');
    // this.layerManager = new LayerManager({ gl: gl });

    // const viewport = new Viewport({width: 500, height: 500});
    // console.log(this.layerManager, this.content);
    // this.layerManager.setViewport(viewport);
  }

  ngOnDestroy() {
    this._cancelAnimationLoop();
  }

  /**
   * Initialize LumaGL library and through it WebGL
   * @param {string} canvas
   */
  _initWebGL(canvas) {
    // Create context if not supplied
    let gl = this.gl;
    if (!gl) {
      try {
        gl = createGLContext(Object.assign({
          canvas: canvas,
          debug: this.debug
        }, this.glOptions));
      } catch (error) {
        this.onInitializationFailed.emit(error);
        return;
      }
    }
    this.gl = gl;
    // Call callback last, in case it throws
    this.onRendererInitialized.emit({canvas, gl});
  }

  /**
   * Main WebGL animation loop
   */
  _animationLoop() {
    this._renderFrame();
    // Keep registering ourselves for the next animation frame
    if (typeof window !== 'undefined') {
      this._animationFrame = requestAnimationFrame(this._animationLoop.bind(this));
    }
  }

  _cancelAnimationLoop() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
  }

  // Updates WebGL viewport to latest props
  // for clean logging, only calls gl.viewport if props have changed
  _updateGLViewport() {
    let {viewport: {x, y, width: w, height: h}} = this;
    const {pixelRatio: dpr} = this;

    x = x * dpr;
    y = y * dpr;
    w = w * dpr;
    h = h * dpr;

    if (x !== this.x || y !== this.y || w !== this.w || h !== this.h) {
      this.gl.viewport(x, y, w, h);
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
  }

  _renderFrame() {
    const {viewport: {width, height}} = this;
    // Check for reasons not to draw
    if (!this.gl || !(width > 0) || !(height > 0)) {
      return;
    }
    this._updateGLViewport();
    // Call render callback
    this.onRenderFrame.emit({gl: this.gl});
    this.onAfterRender.emit(this.overlay);
  }

}
