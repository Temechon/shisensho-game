export let ratio: number;
export let bounds: Phaser.Geom.Rectangle;

export class Boot extends Phaser.Scene {

    constructor() {
        super('boot');
    }

    preload() {
        // Fog of war
        this.load.image('star', 'assets/star.png');

        this.load.atlas('tiles', 'assets/tiles.png', 'assets/tiles.json');
        this.load.bitmapFont('font_normal', 'assets/fonts/font_normal.png', 'assets/fonts/font_normal.xml');
        // this.load.bitmapFont('font_small', 'assets/fonts/font_small.png', 'assets/fonts/font_small.xml');

    }

    create() {

        let w = this.game.config.width as number;
        let h = this.game.config.height as number;

        // let baseW = 740 * 2;
        // let baseH = 360 * 2;

        // let ratioW = w / baseW;
        // let ratioH = h / baseH;

        // if (ratioW > ratioH) {
        //     ratio = ratioH;
        // } else {
        //     ratio = ratioW;
        // }

        // bounds = new Phaser.Geom.Rectangle(
        //     w / 2 - baseW / 2 * ratio,
        //     h / 2 - baseH / 2 * ratio,
        //     baseW * ratio,
        //     baseH * ratio);

        bounds = new Phaser.Geom.Rectangle(
            0,
            0,
            w,
            h);
        ratio = 1;

        // this.game.events.emit('boot_ready');

        // console.log('Bounds - ', bounds);
        // console.log('Game width - ', w);
        // console.log('Game height - ', h);
        // console.log('Window - ', window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio);
        // console.log('ratio - ', ratio);


        // this.scene.start('gameui');
        this.scene.start('game');
        // this.scene.start('end');
    }

}
