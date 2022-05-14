import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Popup } from '../popup';

@Component({
  selector: 'newgame-popup',
  templateUrl: './newgame-popup.component.html',
  styleUrls: ['./newgame-popup.component.scss']
})
export class NewgamePopupComponent extends Popup {

  play(rows: number, cols: number) {
    super.action({ rows, cols });
  }

}
