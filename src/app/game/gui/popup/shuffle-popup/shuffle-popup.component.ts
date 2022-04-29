import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'shuffle-popup',
  templateUrl: './shuffle-popup.component.html',
  styleUrls: ['./shuffle-popup.component.scss']
})
export class ShufflePopupComponent implements OnInit {

  /** The popup to display when the game is finished */
  @ViewChild('popup')
  popup: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  public show() {
    let popup = this.popup.nativeElement as HTMLDivElement;
    popup.classList.remove('hidden');
    popup.classList.add('flex');
  }

  public hide() {
    let popup = this.popup.nativeElement as HTMLDivElement;
    popup.classList.add('hidden');
    popup.classList.remove('flex');
  }

}
