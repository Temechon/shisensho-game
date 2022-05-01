import { Helpers } from "../helpers/Helpers";
import { Constants } from "../model/Constants";
import { Grid } from "../model/Grid";
import { ScoreToast } from "../model/ScoreToast";

export class Game extends Phaser.Scene {

    constructor() {
        super('game');
    }

    seconds: number = 0;

    create() {

        this.seconds = 0;

        let w = this.game.config.width as number;
        let h = this.game.config.height as number;
        console.log('Game width - ', w);
        console.log('Game height - ', h);

        this.input.mouse.preventDefaultWheel = false;

        let grid = new Grid(this, 13, 8)

        grid.x = w / 2;
        grid.y = h / 2;

        this.time.addEvent({
            delay: 1000,
            repeat: -1,
            loop: true,
            callback: () => {
                this.seconds++;
            }
        })

        grid.onFinished = () => {
            this.game.events.emit(Constants.EVENTS.GAME_FINISHED);
            this.scene.launch('end', { rows: grid.size.rows, cols: grid.size.cols });
        }

        let st = new ScoreToast(this);

        let graphics: Phaser.GameObjects.Graphics;

        // Debug - Shuffle the board
        this.input.keyboard.on('keydown-A', () => {

            if (graphics) {
                graphics.destroy();
            }

            grid.shuffleboard();

            grid.doForAllTiles(t => t.hideImage());

            this.time.addEvent({
                delay: 500,
                callback: () => {
                    grid.updateBoard();
                    grid.doForAllTiles(t => t.showImage());
                }
            })
        })

        // Display hint
        this.game.events.on(Constants.EVENTS.SHOW_HINT, () => {
            if (grid.interactive) {
                let hint = grid.getHints(false)[0];
                if (graphics) {
                    graphics.destroy();
                }
                graphics = grid.displayPath(hint.path, hint.t1, hint.t2);

                grid.onNextMove = () => {
                    graphics.destroy();
                    hint.t1.unhighlight();
                    hint.t2.unhighlight();
                }
            }
        })
    }

}
