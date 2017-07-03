import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';

import {default as HexagonLayer} from 'deck.gl/dist-es6/layers/core/hexagon-layer/hexagon-layer';
import {default as ScreenGridLayer} from 'deck.gl/dist-es6/layers/core/screen-grid-layer/screen-grid-layer';

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const elevationScale = {min: 1, max: 50};

@Component({
  selector: 'ri-ng-deck-overlay',
  templateUrl: './ng-deck-overlay.component.html',
  styleUrls: ['./ng-deck-overlay.component.css']
})
export class NgDeckOverlayComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: any[] = [];
  @Input() viewport: any;

  @Input() width: number;
  @Input() height: number;
  @Input() longitude: any;
  @Input() latitude: any;
  @Input() zoom: any;
  @Input() minZoom: any;
  @Input() maxZoom: any;
  @Input() pitch: any;
  @Input() bearing: any;

  public layers: any[] = [];
  public radius: any = 1000;
  public upperPercentile: any = 100;
  public coverage: any = 1;

  private startAnimationTimer: any = null;
  private intervalTimer: any = null;
  private state: any = {
    elevationScale: elevationScale.min
  };

  constructor() {
    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);
  }

  ngOnInit() {
    if (null == this.viewport && (null == this.width || null == this.height)) {
      throw new Error('Attribute \'viewport\' or \'height\' and \'width\' is required');
    }
    this._animate();
  }

  ngOnDestroy() {
    this._stopAnimate();
  }

  ngOnChanges(nextProps) {
    if (nextProps.data && nextProps.data.currentValue.length !== (nextProps.data.previousValue || []).length) {
      this._animate();
    }else{
      this.render();
    }
  }
  _animate() {
    this._stopAnimate();

    // wait 1.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    this.intervalTimer = setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    clearTimeout(this.startAnimationTimer);
    clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.state.elevationScale++;
      this.render();
    }
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    console.log('render layers');

    // this.layers = [
    //   new ScreenGridLayer({
    //     id: 'grid',
    //     data: this.data,
    //     minColor: [0, 0, 0, 0],
    //     getPosition: d => d,
    //     cellSizePixels: 20
    //   })
    // ];

    this.layers = [
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage: this.coverage,
        data: this.data,
        elevationRange: [0, 3000],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getPosition: d => d,
        lightSettings: LIGHT_SETTINGS,
        // onHover: this.props.onHover,
        onHover: () => {},
        opacity: 1,
        pickable: false,
        // pickable: Boolean(this.props.onHover),
        radius: this.radius,
        upperPercentile: this.upperPercentile
      })
    ];
  }

}
