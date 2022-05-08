import randomColor from "randomcolor";

export class Combobar extends Phaser.GameObjects.Container {

    bot: Phaser.GameObjects.Graphics;
    top: Phaser.GameObjects.Graphics;

    height = 20;

    /** The bar progress : 1 it's full, 0 it's empty */
    progress = 1;

    /** The time to empty the combo bar */
    totalduration = 6000;

    animation: Phaser.Tweens.Tween;

    constructor(scene, public width: number) {
        super(scene);

        this.bot = this.scene.make.graphics({ x: 0, y: 0, add: false });
        this.bot.fillStyle(0xffffff, 0.5);
        this.bot.fillRoundedRect(-width / 2, -this.height / 2, width, this.height, 10);


        this.top = this.scene.make.graphics({ x: 0, y: 0, add: false });
        this.top.fillStyle(0x437761, 1);
        this.top.fillRoundedRect(-width / 2, -this.height / 2, width, this.height, 10);

        this.add(this.bot);
        this.add(this.top);

        this.visible = false;

        this.animation = this.scene.tweens.addCounter({
            from: 1,
            to: 0,
            duration: this.totalduration,
            onUpdate: tween => {
                const value = tween.getValue();
                this.setProgress(value);
            },
            onComplete: () => {
                this.visible = false;
            },
            paused: true
        })
    }

    reset() {
        this.setProgress(1);
        this.animation.restart();
    }

    start() {
        this.visible = true;
        this.animation.resume();
    }

    stop() {
        this.animation.pause();
    }

    setProgress(percent: number) {
        this.top.clear();
        this.progress = percent;
        if (percent > 0.01) {
            this.top.fillStyle(0x437761, 1);
            this.top.fillRoundedRect(-this.width / 2, -this.height / 2, this.width * percent, this.height, 10);
        }
    }

    /**
     * Score multiplier according to the progress
     */
    get multiplier(): number {
        if (this.progress > 0.75) {
            return 3;
        }
        if (this.progress > 0.5) {
            return 2;
        }
        if (this.progress > 0.25) {
            return 1.5;
        }
        return 1;
    }
}