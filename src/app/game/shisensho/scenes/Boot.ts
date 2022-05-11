export let ratio: number;
export let bounds: Phaser.Geom.Rectangle;

export class Boot extends Phaser.Scene {

    constructor() {
        super('boot');
    }

    preload() {
        this.load.image('star', 'assets/star.png');

        this.load.atlas('tiles', 'assets/tiles.png', 'assets/tiles.json');
        // this.load.bitmapFont('font_normal', 'assets/fonts/font_normal.png', 'assets/fonts/font_normal.xml');

    }

    create() {

        let w = this.game.config.width as number;
        let h = this.game.config.height as number;

        bounds = new Phaser.Geom.Rectangle(
            0,
            0,
            w,
            h);
        ratio = 1;

        this.scene.start('game');
    }

}
