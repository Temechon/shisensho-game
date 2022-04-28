import { Helpers } from "../helpers/Helpers";
import { getBestScaleForTiles, Grid } from "../model/Grid";
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

    private size: { rows: number, cols: number };

    init(data: any) {
        this.size = { rows: data.rows, cols: data.cols };
    }

    create() {
        let tileCache = this.textures.getFrame('tiles', 'bamboo/0');
        this.tileWidth = (tileCache.width + 25) * ratio;
        this.tileHeight = this.tileWidth * 1.3
        let size = { width: this.tileWidth, height: this.tileHeight };

        let tiles = [];

        let bestScale = getBestScaleForTiles({ tileWidth: this.tileWidth, tileHeight: this.tileHeight }, this.size);

        // Build two tiles for each tile type
        let counter = 0;
        let nbtiles = this.size.rows * this.size.cols;
        for (let [type, nbTiles] of Grid.TILES_TYPES) {
            for (let i = 0; i < nbTiles && counter++ < nbtiles; i++) {
                for (let k = 0; k < 2; k++) {
                    let t = new Tile(this, 0, 0, size, `${type}/${i}`)
                    t.y = -3000;
                    tiles.push(t);
                    t.scale = bestScale;
                    this.add.existing(t);
                }
            }
            if (counter > nbtiles) {
                break;
            }
        }

        // Shuffle tiles
        Helpers.shuffle(tiles);

        nbtiles = Math.min(nbtiles - 1, tiles.length - 1);

        this.time.addEvent({
            delay: 50,
            repeat: nbtiles,
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

        // Create full size rectangle to create a light background
        let rect = this.add.rectangle(0, 0, bounds.width, bounds.height, 0x000000, 0.5);
        rect.setOrigin(0)
    }
}