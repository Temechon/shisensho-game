import { Helpers } from "../helpers/Helpers";
import { Constants } from "../model/Constants";
import { Grid } from "../model/Grid";

export class Game extends Phaser.Scene {

    constructor() {
        super('game');
    }

    create() {

        let w = this.game.config.width as number;
        let h = this.game.config.height as number;
        console.log('Game width - ', w);
        console.log('Game height - ', h);

        this.input.mouse.preventDefaultWheel = false;


        let style = {
            fontSize: Helpers.font(50),
            fill: "#fff",
            fontFamily: "OpenSans"
        };

        let grid = new Grid(this, 6, 5)

        grid.x = w / 2;
        grid.y = h / 2;

        grid.onFinished = () => {
            this.game.events.emit(Constants.EVENTS.GAME_FINISHED);
            this.scene.launch('end', { rows: grid.size.rows, cols: grid.size.cols });
        }

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

        // Debug - Display hint
        this.input.keyboard.on('keydown-Z', () => {
            if (grid.interactive) {
                let hint = grid.getHints(false)[0];
                if (graphics) {
                    graphics.destroy();
                }
                graphics = grid.displayPath(hint.path, hint.t1, hint.t2);

                grid.onNextMatch = () => {
                    graphics.destroy();
                }
            }
        })
    }

}
