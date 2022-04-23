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

        let grid = new Grid(this, 7, 6)

        grid.x = w / 2;
        grid.y = h / 2;

        let debug = new Debugger(this);
        let rect = new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
        rect.width -= 90;
        rect.x += 45;
        rect.height -= 90;
        rect.y += 45;

        // debug.rectangle(rect);

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
