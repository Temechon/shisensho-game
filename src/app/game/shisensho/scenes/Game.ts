import { Helpers } from "../helpers/Helpers";
import { Combobar } from "../model/Combobar";
import { Constants } from "../model/Constants";
import { Grid } from "../model/Grid";
import { Path } from "../model/Path";
import { ScoreToast } from "../model/ScoreToast";
import { Solver } from "../model/Solver";
import { Tile } from "../model/Tile";

export class Game extends Phaser.Scene {

    constructor() {
        super('game');
    }

    seconds: number = 0;
    score = 0;

    create() {

        this.seconds = 0;
        this.score = 0;

        let w = this.game.config.width as number;
        let h = this.game.config.height as number;
        console.log('Game width - ', w);
        console.log('Game height - ', h);

        this.input.mouse.preventDefaultWheel = false;


        let grid = new Grid(this, 13, 8)

        grid.x = w / 2;
        grid.y = h / 2 + 45;

        // Combo bar
        let combobar = new Combobar(this, grid.widthPx * grid.scale * 1.1);
        combobar.x = w / 2;
        combobar.y = 75
        this.add.existing(combobar);
        combobar.setProgress(0.5);

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

        grid.onMatch = (t1: Tile, t2: Tile) => {

            // Create score toast at t1 position
            let toast = new ScoreToast(this, 100);
            toast.displayAt(t1.x + grid.x, t1.y + grid.y);

            toast.depth = 10;
            // Add score
            this.score += 100;

            this.game.events.emit(Constants.EVENTS.ADD_SCORE, 100);
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

        // Debug - resolve the board
        // TODO
        this.input.keyboard.on('keydown-R', () => {

            // let hints = grid.getHints(false);
            // let counter = 0;
            // while (hints.length > 0) {
            //     counter++
            //     console.log("Hint found");

            //     let { t1, t2 } = hints[0];

            //     // Update the grid by removing both tiles                    
            //     grid.setTile(t1.row, t1.col, null);
            //     grid.setTile(t2.row, t2.col, null);

            //     // If grid is empty, game is finished
            //     if (grid.isFinished()) {
            //         console.log(`Game finished without shuffle in ${counter} steps`);
            //         break;
            //     } else {
            //         hints = grid.getHints(false)
            //     }
            // }
            // console.log("Hints", counter);

            while (Solver.Solve(grid) === null) {
                console.log("Shuffling");
                grid.shuffleboard();
            }
            grid.updateBoard();



            // // Update the grid by removing both tiles                    
            // grid.setTile(t1.row, t1.col, null);
            // grid.setTile(t2.row, t2.col, null);
            // t1.destroy();
            // t2.destroy();
            // let hint = grid.getHints(false);
            // if (hint.length === 0) {
            //     grid.shuffleboard(true);
            // }
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
