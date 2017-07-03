import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Viewport, WebMercatorViewport} from 'deck.gl/dist-es6/lib/viewports';

@Component({
  selector: 'ri-gmaps',
  templateUrl: './gmaps.component.html',
  styleUrls: ['./gmaps.component.css']
})
export class GmapsComponent implements OnInit {
  @Output() viewportChange: EventEmitter<WebMercatorViewport> = new EventEmitter();
  @Input() viewport: WebMercatorViewport;

  constructor() { }

  ngOnInit() {
    this.viewportChange.emit(this.viewport);
  }

  centerChange(latLngBounds) {
    this.viewport.latitude = latLngBounds.lat;
    this.viewport.longitude = latLngBounds.lng;
    this.viewportChange.emit(this.viewport);
  }

  zoomChange(zoom) {
    this.viewport.zoom = zoom - 1;
    this.viewportChange.emit(this.viewport);
  }

}
