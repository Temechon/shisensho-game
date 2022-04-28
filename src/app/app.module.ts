import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { ReplayPopupComponent } from './game/gui/popup/replay-popup/replay-popup.component';
import { ShufflePopupComponent } from './game/gui/popup/shuffle-popup/shuffle-popup.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    ReplayPopupComponent,
    ShufflePopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
