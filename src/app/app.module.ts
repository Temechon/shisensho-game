import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { ReplayPopupComponent } from './game/gui/popup/replay-popup/replay-popup.component';
import { ShufflePopupComponent } from './game/gui/popup/shuffle-popup/shuffle-popup.component';
import { OptionsPopupComponent } from './game/gui/popup/options-popup/options-popup.component';
import { ToggleComponent } from './game/gui/toggle/toggle.component';
import { NewgamePopupComponent } from './game/gui/popup/newgame-popup/newgame-popup.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    ReplayPopupComponent,
    ShufflePopupComponent,
    OptionsPopupComponent,
    ToggleComponent,
    NewgamePopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
