import { Helpers } from "../helpers/Helpers";
import { Grid } from "../model/Grid";
import { Tile } from "../model/Tile";
import { bounds, ratio } from "./Boot";

export class End extends Phaser.Scene {

    container: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'end' });
    }

    /** Tile width - with ratio */
    private tileWidth: number = 0;
    private tileHeight: number = 0;

    private nbtiles: number = 0;

    init(data: any) {
        this.nbtiles = data.nbtiles;
    }

    create() {

        let tileCache = this.textures.getFrame('tiles', 'bamboo/0');
        this.tileWidth = (tileCache.width + 25) * ratio;
        this.tileHeight = this.tileWidth * 1.3
        let size = { width: this.tileWidth, height: this.tileHeight };

        let tiles = [];

        // Build two tiles for each tile type
        let counter = 0;
        for (let [type, nbTiles] of Grid.TILES_TYPES) {
            for (let i = 0; i < nbTiles && counter++ < this.nbtiles; i++) {
                for (let k = 0; k < 2; k++) {
                    let t = new Tile(this, 0, 0, size, `${type}/${i}`)
                    t.y = -3000;
                    tiles.push(t);
                    this.add.existing(t);
                }
            }
            if (counter > this.nbtiles) {
                break;
            }
        }
        console.log(counter);

        // Shuffle tiles
        Helpers.shuffle(tiles);

        this.nbtiles = Math.min(this.nbtiles - 1, tiles.length - 1);

        this.time.addEvent({
            delay: 50,
            repeat: this.nbtiles,
            callback: () => {
                // Make random tiles fall to the bottom of the screen
                let randomX = Phaser.Math.Between(0, bounds.width);

                // Get random tile
                let tile = tiles.pop();
                tile.x = randomX;
                tile.y = -100;

                this.add.tween({
                    targets: tile,
                    y: bounds.height - this.tileHeight / 2,
                    duration: 2000,
                    ease: Phaser.Math.Easing.Bounce.Out,
                    onComplete: () => {

                        this.add.tween({
                            targets: tile,
                            y: bounds.height + 200,
                            duration: 500,
                            onComplete: () => {
                                tile.y = -3000;
                                // tiles.push(tile);
                            }
                        })
                    }
                })
            }
        })
    }
}