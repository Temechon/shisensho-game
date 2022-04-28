import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'replay-popup',
  templateUrl: './replay-popup.component.html',
  styleUrls: ['./replay-popup.component.scss']
})
export class ReplayPopupComponent implements OnInit {

  /** The popup to display when the game is finished */
  @ViewChild('popup')
  popup: ElementRef;

  /** Output event emitted when the action button is clicked */
  @Output()
  public onAction = new EventEmitter();

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

  action() {
    this.onAction.emit();
  }

}
