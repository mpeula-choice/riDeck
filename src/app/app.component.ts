import { Component, HostListener, OnInit } from '@angular/core';

declare var require;
const data = require('./heatmap-data.json')

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  viewport: any = {
    longitude: -1.4157267858730052,
    latitude: 52.232395363869415,
    zoom: 6,
    minZoom: 5,
    maxZoom: 15,
    pitch: 0,
    bearing: 0,
    width: 800,
    height: 800
  };
  data = data.filter((value, index) => !(index % 5));

  ngOnInit() {

  }

}
