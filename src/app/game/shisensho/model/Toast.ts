import randomColor from "randomcolor";

export class Toast extends Phaser.GameObjects.Container {

    text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, options: {
        text: string,
        fontSize?: number,
        color: string,
    }) {
        super(scene);

        options.fontSize = options.fontSize || 40;
        // Text
        let style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Jost',
            fontStyle: 'bold',
            fontSize: `${options.fontSize}px`,
            color: options.color,
            stroke: '#fff',
            strokeThickness: 7,
            align: 'center'
        };
        let toastText = this.scene.add.text(0, 0, options.text, style)
        toastText.setOrigin(0.5, 0.5);
        this.add(toastText);

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