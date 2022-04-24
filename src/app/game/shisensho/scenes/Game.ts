import { Grid } from "../model/Grid";
import { Debugger } from "../helpers/Debugger";
import { Helpers } from "../helpers/Helpers";
import { bounds } from "./Boot";

export class Game extends Phaser.Scene {

    static INSTANCE: Game;

    constructor() {
        super('game');
        Game.INSTANCE = this;
    }

    create() {

        let w = this.game.config.width as number;
        let h = this.game.config.height as number;
        console.log('Game width - ', w);
        console.log('Game height - ', h);


        let style = {
            fontSize: Helpers.font(50),
            fill: "#fff",
            fontFamily: "OpenSans"
        };

        let grid = new Grid(this, 13, 8)

        grid.x = w / 2;
        grid.y = h / 2;

        grid.onFinished = () => {
            this.scene.launch('end', { nbtiles: grid.size.cols * grid.size.rows });
        }

        // Debug - Shuffle the board
        this.input.keyboard.on('keydown-A', () => {
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
        let graphics: Phaser.GameObjects.Graphics;
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

        // let paths = grid.getAllPossibleMoves();
        // console.log(paths);

        // for (let p of paths) {
        //     grid.displayPath(p.path)
        // }


        // let i = this.add.sprite(w / 2, h / 2, 'tiles');
        // let i = this.add.tileSprite(w / 2, h / 2, 0, 0, 'tiles', '1f1e6-1f1f4.png');
        // i.scale = ratio;


    }

}
