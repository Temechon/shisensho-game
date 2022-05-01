export class ScoreToast extends Phaser.GameObjects.Container {

    constructor(scene: Phaser.Scene) {
        super(scene);

        // Text
        let style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Jost',
            fontStyle: 'bold',
            fontSize: "30px",
            color: '#005C53',
            stroke: '#fff',
            strokeThickness: 7,
            align: 'center'
        };
        this.scene.add.text(0, 0, "+10\nwow!", style)
    }


}