import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
/**
 * This toggle is true by default
 */
export class ToggleComponent implements OnInit {

  @ViewChild('toggle', { static: true })
  toggleDiv: ElementRef;

  @Input()
  check: boolean = true;

  @Output()
  checkChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    if (!this.check) {
      this._setToUncheck();
    }

  }

  switch() {
    if (this.check) {
      // Then set to uncheck
      this._setToUncheck();
      this.check = false;
    } else {
      // Then set to check
      this._setToCheck();
      this.check = true;
    }
    this.checkChange.emit(this.check);
  }

  private _setToUncheck() {
    const toggleButton = this.toggleDiv.nativeElement as HTMLDivElement;
    toggleButton.classList.add('-translate-x-7');
    toggleButton.classList.remove('bg-green-600');
    toggleButton.classList.add('bg-gray-500')

    const bg = toggleButton.parentElement as HTMLDivElement;
    bg.classList.remove('bg-green-200');
    bg.classList.add('bg-gray-300');
  }

  private _setToCheck() {
    const toggleButton = this.toggleDiv.nativeElement as HTMLDivElement;
    toggleButton.classList.remove('-translate-x-7');
    toggleButton.classList.add('bg-green-600');
    toggleButton.classList.remove('bg-gray-500')

    const bg = toggleButton.parentElement as HTMLDivElement;
    bg.classList.add('bg-green-200');
    bg.classList.remove('bg-gray-300');
  }

}
