import { Component } from '@angular/core';
import { Popup } from '../popup';

@Component({
  selector: 'options-popup',
  templateUrl: './options-popup.component.html',
  styleUrls: ['./options-popup.component.scss']
})
export class OptionsPopupComponent extends Popup {


  /** Global game options */
  options = {
    noshuffles: false,
    gravity: 'no'
  }

  ngOnInit(): void {
    super.ngOnInit();

    // Get option in localstorage if exists
    const options = localStorage.getItem('shisensho.options');
    if (options) {
      this.options = JSON.parse(options);
    }

    // Init gravity according to its value
    document.querySelectorAll('.gravitybutton').forEach(button => {
      button.classList.remove('bg-board-green');
      button.classList.remove('shadow-md');
      button.classList.remove('text-white');

      button.classList.add('bg-white');
      button.classList.add('text-black');

      if ((button as HTMLElement).dataset.gravity === this.options.gravity) {

        button.classList.remove('bg-white');
        button.classList.remove('text-black');

        button.classList.add('bg-board-green');
        button.classList.add('shadow-md');
        button.classList.add('text-white');
      };
    });
  }


  selectGravity($event) {
    document.querySelectorAll('.gravitybutton').forEach(button => {
      button.classList.remove('bg-board-green');
      button.classList.remove('shadow-md');
      button.classList.remove('text-white');

      button.classList.add('bg-white');
      button.classList.add('text-black');
    });

    let target = $event.target as HTMLElement;
    if (!target.classList.contains('gravitybutton')) {
      target = target.parentElement;
    }

    target.classList.remove('bg-white');
    target.classList.remove('text-black');

    target.classList.add('bg-board-green');
    target.classList.add('shadow-md');
    target.classList.add('text-white');

    this.options.gravity = target.dataset.gravity;
  }

  hide() {
    // save options in localstorage
    localStorage.setItem('shisensho.options', JSON.stringify(this.options));

    super.hide();
  }
}
