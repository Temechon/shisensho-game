import { Combobar } from "../model/Combobar";
import { Constants } from "../model/Constants";
import { Grid } from "../model/Grid";
import { Solver } from "../model/Solver";
import { Tile } from "../model/Tile";
import { Toast } from "../model/Toast";
import randomColor from "randomcolor";

export class Game extends Phaser.Scene {

    constructor() {
        super('game');
    }

    seconds: number = 0;
    score = 0;
    size: { rows: number, cols: number } = { rows: 2, cols: 2 };

    init(data: { rows: number, cols: number }) {
        if (data.rows) {
            this.size = { rows: data.rows, cols: data.cols };
        }
    }
    create() {

        this.seconds = 0;
        this.score = 0;

        let w = this.game.config.width as number;
        let h = this.game.config.height as number;

        this.input.mouse.preventDefaultWheel = false;

        // Grid
        let grid = new Grid(this, this.size.cols, this.size.rows);

        grid.x = w / 2;
        grid.y = h / 2 + 45;

        console.log("max path", Solver.GetMaxPath(grid));


        // Combo bar
        let combobar = new Combobar(this, grid.widthPx * grid.scale * 1.1);
        combobar.x = w / 2;
        combobar.y = 75
        this.add.existing(combobar);
        combobar.setProgress(0)

        // Pause the combo bar when shuffling
        this.game.events.on(Constants.EVENTS.SHUFFLING, () => {
            combobar.pause();
        })

        // When shuffling is done, restart the combo bar after a few seconds
        this.game.events.on(Constants.EVENTS.SHUFFLING_DONE, () => {
            this.time.addEvent({
                delay: 500,
                callback: () => {
                    combobar.resume();
                }
            })
        })

        // Time
        this.time.addEvent({
            delay: 1000,
            repeat: -1,
            loop: true,
            callback: () => {
                this.seconds++;
            }
        })

        this.game.events.on(Constants.EVENTS.GAME_FINISHED, () => {
            combobar.stop();
            this.scene.launch('end', {
                rows: grid.size.rows, cols: grid.size.cols, tilesNames: grid.tilesNames
            });
        });

        this.game.events.on(Constants.EVENTS.INCORRECT_MOVE_DONE, (t1: Tile, t2: Tile) => {
            combobar.stop();
        })

        this.game.events.on(Constants.EVENTS.CORRECT_MOVE_DONE, (t1: Tile, t2: Tile) => {

            let score = 100 * combobar.multiplier;

            // Start the combo bar at the first correct move
            combobar.reset();


            const colorHex = randomColor({ luminosity: 'light', format: 'hex' })

            // Create score toast at t1 position
            let toast = new Toast(this, {
                text: `+ ${score}!`,
                color: colorHex
            });
            toast.displayAt(t1.x + grid.x, t1.y + grid.y);
            toast.depth = 10;

            let messagesByLevel = [
                ['Nice', 'Way to go', 'I like that', 'Good choice', "That's correct", "Keep it up", "Smart", "You're doing great"],
                ['Very nice', 'You winner', 'Very good', 'Awesome!', 'Great!', 'Perfect!', 'Good job!', 'BINGO', 'Now you know it!'],
                ['Fantastic job!', 'You rock!', 'WHOO HOO!', 'WHAT A TALENT!', 'You are a genius!'],
                ['TERRIFIC!', 'EXCELLENT!!', 'FANTASTIC!!', 'WONDERFUL!!', 'SUPER!!', 'AWESOME!!', "THAT'S INCREDIBLE!", "YOU ROCK!"],
                ["THAT'S AWESOME!!", "YOU ROCK!!", "YOU'RE A GOD!", "FANTASTIC!", "SO COOL!", "YOU'RE A ROCKSTAR!"],
            ]

            if (combobar.combostrike > 0 && Phaser.Math.RND.frac() > 0.5) {
                let message = Phaser.Math.Clamp(combobar.combostrike - 1, 0, 4);
                let messageText = Phaser.Math.RND.pick(messagesByLevel[message])

                let combomessage = new Toast(this, {
                    text: messageText,
                    fontSize: combobar.combostrike * 1.5 + 40,
                    color: colorHex
                });
                // combomessage.displayAt(w / 2, 100);
                combomessage.displayAt(t1.x + grid.x, t1.y + grid.y + 100);
                combomessage.depth = 10;
            }

            // Add score
            this.score += score;

            this.game.events.emit(Constants.EVENTS.ADD_SCORE, score);
        })

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

        // Debug - Find a grid with no shuffle
        this.input.keyboard.on('keydown-R', () => {

            while (Solver.Solve(grid) === null) {
                console.log("Shuffling");
                grid.shuffleboard();
            }
            grid.updateBoard();
        })

        // Display hint
        this.game.events.on(Constants.EVENTS.SHOW_HINT, () => {
            if (grid.interactive) {
                let hint = grid.getHints(false)[0];
                if (graphics) {
                    graphics.destroy();
                }
                graphics = grid.displayPath(hint.path, hint.t1, hint.t2);

                // Delete everything on the next move
                this.game.events.once(Constants.EVENTS.MOVE_DONE, () => {
                    graphics.destroy();
                    hint.t1.unhighlight();
                    hint.t2.unhighlight();
                })
            }
        })
    }

}
