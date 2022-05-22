import { Directive, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";


@Directive()
export abstract class Popup {

    /** The popup to display when the game is finished */
    @ViewChild('popup')
    popup: ElementRef;

    /** Output event emitted when the action button is clicked */
    @Output()
    public onAction = new EventEmitter();

    /** Output event emitted when the popup is closed */
    @Output()
    public onClose = new EventEmitter();

    /** Data given to the popup when opening it up */
    public inputData: any;

    action(data?: any) {
        this.onAction.emit(data);
    }

    constructor() { }

    ngOnInit(): void {
    }

    public show(data?: any) {
        this.inputData = data;
        let popup = this.popup.nativeElement as HTMLDivElement;
        popup.classList.remove('hidden');
        popup.classList.add('flex');
        this.onShow();
    }

    public hide() {
        let popup = this.popup.nativeElement as HTMLDivElement;
        popup.classList.add('hidden');
        popup.classList.remove('flex');
    }

    public close() {
        this.hide();
        this.onClose.emit();
    }

    protected onShow() {
        // Should be overridden in subclasses
    };
}