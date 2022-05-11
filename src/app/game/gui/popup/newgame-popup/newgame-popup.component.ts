import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Popup } from '../popup';

@Component({
  selector: 'newgame-popup',
  templateUrl: './newgame-popup.component.html',
  styleUrls: ['./newgame-popup.component.scss']
})
export class NewgamePopupComponent extends Popup {

  size: any = { rows: 6, cols: 6 }

  /** Output event emitted when the action button is clicked */
  @Output()
  public onPlay = new EventEmitter<any>();

  play() {
    this.onPlay.emit(this.size);
    this.hide();
  }

}
