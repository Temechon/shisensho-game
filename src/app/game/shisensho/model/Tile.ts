import { ratio } from "../scenes/Boot";

export class Tile extends Phaser.GameObjects.Container {

    private top: Phaser.GameObjects.Graphics;
    private bot: Phaser.GameObjects.Graphics;
    icon: Phaser.GameObjects.TileSprite;

    private highlight: Phaser.GameObjects.Graphics;

    isSelected = false;

    static THICKNESS = 6;

    emitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(
        scene: Phaser.Scene,
        public row: number,
        public col: number,
        public size: { width: number, height: number },
        public tileid: string
    ) {
        super(scene)

        this.top = this.scene.make.graphics({ x: 0, y: 0, add: false });
        this.bot = this.scene.make.graphics({ x: 0, y: Tile.THICKNESS * ratio, add: false });
        this.highlight = this.scene.make.graphics({ x: 0, y: 0, add: false });
        this.icon = this.scene.add.tileSprite(0, 0, 0, 0, 'tiles', this.tileid);
        this.icon.scale = ratio;

        this.add(this.bot);
        this.add(this.top);
        this.add(this.icon);
        this.add(this.highlight);

        this.build();

        // Inputs
        let w = this.size.width;
        let h = this.size.height;
        let rect = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
        this.setInteractive(rect, Phaser.Geom.Rectangle.Contains);

        const particles = this.scene.add.particles('star');

        this.emitter = particles.createEmitter({
            blendMode: Phaser.BlendModes.ADD,
            tint: [0xffff00],
            speed: 1000,
            lifespan: 500,
            frequency: 100,
            on: false,
            scale: 0.25
        });
    }

    public get xy(): Phaser.Geom.Point {
        return new Phaser.Geom.Point(this.x, this.y);
    }

    select() {
        // Bringing the tile to the top of the parent container.
        this.parentContainer.bringToTop(this)
        if (!this.isSelected) {
            // If this tile is not selected, select it
            this.scene.add.tween({
                targets: [this.icon, this.top, this.highlight],
                duration: 100,
                y: Tile.THICKNESS * ratio
            })

            this.scene.add.tween({
                targets: this.highlight,
                duration: 100,
                alpha: 1,
                scale: {
                    from: 2,
                    to: 1
                }
            })

            this.isSelected = true;
        }
    }

    unselect() {
        // Bringing the tile to the top of the parent container.
        this.parentContainer.bringToTop(this)
        if (this.isSelected) {
            // If this tile is selected, unselect it
            this.scene.add.tween({
                targets: [this.icon, this.top, this.highlight],
                duration: 100,
                y: 0
            })

            this.scene.add.tween({
                targets: this.highlight,
                duration: 100,
                alpha: 0,
                scale: {
                    from: 1,
                    to: 2
                }
            })
            this.isSelected = false;
        }
    }

    destroy(): Promise<void> {
        return new Promise((resolve) => {
            this.emitter.emitParticleAt(this.parentContainer.x + this.x, this.parentContainer.y + this.y, 4)
            this.scene.add.tween({
                targets: [this],
                duration: 250,
                scale: 2,
                alpha: 0,
                ease: Phaser.Math.Easing.Quartic.InOut,
                onComplete: () => {
                    resolve();
                    super.destroy()
                }
            })
        })
    }


    build() {
        this.top.clear();
        this.bot.clear();

        // let color = this._grid.getColor(this.level)
        let w = this.size.width;
        let h = this.size.height;

        this.top.fillStyle(0xffffff);
        this.top.fillRoundedRect(-w / 2, -h / 2, w, h, w * 0.1);

        this.bot.fillStyle(0x333);
        this.bot.fillRoundedRect(-w / 2, -h / 2, w, h, w * 0.1);

        this.highlight.fillStyle(0xff0000);
        this.highlight.lineStyle(8 * ratio, 0xff0000);
        this.highlight.strokeRoundedRect(-w / 2, -h / 2, w, h, w * 0.1);
        this.highlight.alpha = 0;

    }
}