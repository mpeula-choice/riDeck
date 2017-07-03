import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { NgDeckComponent } from './components/ng-deck/ng-deck.component';
import { WebglRendererComponent } from './components/webgl-renderer/webgl-renderer.component';
import { NgDeckOverlayComponent } from './components/ng-deck-overlay/ng-deck-overlay.component';
import { GmapsComponent } from './components/gmaps/gmaps.component';

@NgModule({
  declarations: [
    AppComponent,
    NgDeckComponent,
    WebglRendererComponent,
    NgDeckOverlayComponent,
    GmapsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AgmCoreModule.forRoot({
      clientId: 'gme-choicetechnologies',
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
