import randomColor from "randomcolor";

export class Combobar extends Phaser.GameObjects.Container {

    bot: Phaser.GameObjects.Graphics;
    top: Phaser.GameObjects.Graphics;

    height = 20;

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

        this.scene.tweens.addCounter({
            from: 1,
            to: 0,
            duration: 2500,
            onUpdate: tween => {
                const value = tween.getValue();
                this.setProgress(value);
            }
        })

    }

    setProgress(percent: number) {
        this.top.clear();
        if (percent > 0.1) {
            this.top.fillStyle(0x437761, 1);
            this.top.fillRoundedRect(-this.width / 2, -this.height / 2, this.width * percent, this.height, 10);
        }
    }
}