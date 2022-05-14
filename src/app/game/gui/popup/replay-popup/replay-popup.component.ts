import { Component, Input } from '@angular/core';
import { Popup } from '../popup';

@Component({
  selector: 'replay-popup',
  templateUrl: './replay-popup.component.html',
  styleUrls: ['./replay-popup.component.scss']
})
export class ReplayPopupComponent extends Popup {


  action() {
    super.action();
    this.close();
  }

}
