import { Directive, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";


@Directive()
export abstract class Popup {

    /** The popup to display when the game is finished */
    @ViewChild('popup')
    popup: ElementRef;

    /** Output event emitted when the action button is clicked */
    @Output()
    public onAction = new EventEmitter();

    /** Output event emitted when the action button is clicked */
    @Output()
    public onClose = new EventEmitter();


    action() {
        this.onAction.emit();
    }

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
        this.onClose.emit();
    }
}