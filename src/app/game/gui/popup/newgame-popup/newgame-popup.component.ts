import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Popup } from '../popup';

@Component({
  selector: 'newgame-popup',
  templateUrl: './newgame-popup.component.html',
  styleUrls: ['./newgame-popup.component.scss']
})
export class NewgamePopupComponent extends Popup {

  // size: any = { rows: 8, cols: 18 }

  /** Output event emitted when the action button is clicked */
  @Output()
  public onPlay = new EventEmitter<any>();

  play(rows: number, cols: number) {
    this.onPlay.emit({ rows: rows, cols: cols });
    this.hide();
  }

}
