import { ratio } from "../scenes/Boot";

export class Tile extends Phaser.GameObjects.Container {

    private top: Phaser.GameObjects.Graphics;
    private bot: Phaser.GameObjects.Graphics;
    icon: Phaser.GameObjects.TileSprite;

    private border: Phaser.GameObjects.Graphics;

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
        this.border = this.scene.make.graphics({ x: 0, y: 0, add: false });
        this.icon = this.scene.add.tileSprite(0, 0, 0, 0, 'tiles', this.tileid);
        this.icon.scale = ratio;

        this.add(this.bot);
        this.add(this.top);
        this.add(this.icon);
        this.add(this.border);

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
                targets: [this.icon, this.top, this.border],
                duration: 100,
                y: Tile.THICKNESS * ratio
            })

            this.highlight();
            this.isSelected = true;
        }
    }

    /**
     * Display the border of this tile.
     */
    highlight() {
        this.parentContainer.bringToTop(this)
        this.scene.add.tween({
            targets: this.border,
            duration: 100,
            alpha: 1,
            scale: {
                from: 2,
                to: 1
            }
        })
    }

    /**
     * Removes the border of this tile.
     */
    unhighlight() {
        this.parentContainer.bringToTop(this)
        this.scene.add.tween({
            targets: this.border,
            duration: 100,
            alpha: 0,
            scale: {
                from: 1,
                to: 2
            }
        })
    }

    unselect() {
        // Bringing the tile to the top of the parent container.
        this.parentContainer.bringToTop(this)
        if (this.isSelected) {
            // If this tile is selected, unselect it
            this.scene.add.tween({
                targets: [this.icon, this.top, this.border],
                duration: 100,
                y: 0
            })

            this.unhighlight();
            this.isSelected = false;
        }
    }

    destroy() {
        this.emitter.emitParticleAt(this.parentContainer.x + this.x, this.parentContainer.y + this.y, 4)
        this.scene.add.tween({
            targets: [this],
            duration: 250,
            scale: 2,
            alpha: 0,
            ease: Phaser.Math.Easing.Quartic.InOut,
            onComplete: () => {
                super.destroy()
            }
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

        this.border.fillStyle(0xff0000);
        this.border.lineStyle(8 * ratio, 0xff0000);
        this.border.strokeRoundedRect(-w / 2, -h / 2, w, h, w * 0.1);
        this.border.alpha = 0;
    }

    /**
     * Hide this tile by making its icon disapear with a litlle animation
     */
    hideImage(): Phaser.Tweens.Tween {

        // Unhighlight the tile
        this.unhighlight();
        return this.scene.add.tween({
            targets: [this.icon],
            duration: 500,
            scale: 0,
            angle: 360 * 4,
            ease: Phaser.Math.Easing.Quartic.InOut,
        })
    }

    /**
     * Display this tile
     */
    showImage() {
        this.scene.add.tween({
            targets: [this.icon],
            duration: 500,
            scale: 1,
            angle: 0,
            ease: Phaser.Math.Easing.Quartic.InOut,
        })
    }
}