import randomColor from "randomcolor";

export class ScoreToast extends Phaser.GameObjects.Container {

    colorHex: string;
    text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, score: number) {
        super(scene);

        this.colorHex = randomColor({ luminosity: 'dark', format: 'hex' })

        // Text
        let style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Jost',
            fontStyle: 'bold',
            fontSize: "40px",
            color: this.colorHex,
            stroke: '#fff',
            strokeThickness: 7,
            align: 'center'
        };
        let text = this.scene.add.text(0, 0, `+${score}!`, style)
        text.setOrigin(0.5, 0.5);
        this.add(text);

        this.scene.add.existing(this);
    }

    displayAt(x: number, y: number) {
        this.x = x;
        this.y = y;
        // Bounce tween when appearing
        this.scene.tweens.add({
            targets: this,
            y: this.y,
            scale: {
                from: 0,
                to: 1.2
            },
            duration: 500,
            ease: Phaser.Math.Easing.Bounce.Out,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this,
                    y: this.y - 100,
                    alpha: 0,
                    duration: 350,
                    delay: 150,
                    onComplete: () => {
                        this.destroy();
                    }
                });
            }
        });
    }


}