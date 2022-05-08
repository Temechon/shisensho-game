import { bounds, ratio } from "../scenes/Boot";
import { Path } from "./Path";
import { Tile } from "./Tile";
import * as _ from 'underscore';
import { Constants } from "./Constants";

export class Grid extends Phaser.GameObjects.Container {

    public size: { cols: number, rows: number };

    /** Number of pixel between two cells */
    public static GUTTER_SIZE = 10;
    /** Number of pixel between two cells */
    public static GUTTER_SIZE_H = 15;

    /**
     * 
     * 0  1  2  3  4 (cols) = width
     * 1
     * 2
     * 3
     * 4
     * (rows)
     * height
     * 
     * _cells[row][col]
     */
    public tiles: Array<Array<Tile>> = [];

    static TILES_TYPES: Map<string, number> = new Map<string, number>([
        ['dots', 18],
        ['bamboo', 18],
        ['characters', 18],
        ['winds', 8],
        ['dragons', 6],
        ['seasons', 2],
        ['flowers', 2]
    ]);

    interactive = true;

    /** Tile width - with ratio */
    private tileWidth: number = 0;
    private tileHeight: number = 0;


    constructor(
        scene: Phaser.Scene,
        nb_cols: number,
        nb_lines: number) {

        super(scene);

        let tileCache = this.scene.textures.getFrame('tiles', 'bamboo/0');
        this.tileWidth = (tileCache.width + 25) * ratio;
        this.tileHeight = this.tileWidth * 1.3

        let size = { width: this.tileWidth, height: this.tileHeight };
        this.size = { cols: nb_cols, rows: nb_lines };

        this.scene.add.existing(this);

        for (let i = 0; i < this.size.rows; i++) {
            this.tiles[i] = [];
        }

        let tiles = [];

        // Build two tiles for each tile type
        for (let [type, nbTiles] of Grid.TILES_TYPES) {
            for (let i = 0; i < nbTiles; i++) {
                for (let k = 0; k < 2; k++) {
                    let t = new Tile(this.scene, 0, 0, size, `${type}/${i}`)
                    tiles.push(t);
                }
            }
        }

        // Remove all useless tiles
        tiles = _.head(tiles, nb_cols * nb_lines);

        // Create a sorted array of tiles
        let tcount = 0;
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.cols; j++) {
                let tile = tiles[tcount++];
                tile.row = i;
                tile.col = j;

                tile.x = j * this.tileWidth + Grid.GUTTER_SIZE * j;
                tile.y = i * this.tileHeight + Grid.GUTTER_SIZE_H * i;

                this.setTile(i, j, tile);
            }
        }

        // Update the grid according to the number of tiles
        this.scale = getBestScaleForTiles({
            tileWidth: this.tileWidth,
            tileHeight: this.tileHeight
        }, this.size)

        this.shuffleboard(true);

        // Animate all tiles to their positions
        let delay = 0;

        this.doForAllTiles(t => {
            // t.alpha = 0;
            t.y = -this.heightPx / 2 - 200
        })
        this.doForAllTiles(t => {
            // let pos = this.getTilePositionOnBoard(t);
            // t.x = pos.x;
            // t.y = pos.y;
            // console.log(pos);

            this.scene.add.tween({
                targets: t,
                delay: delay,
                duration: Phaser.Math.Between(750, 1250),
                y: {
                    from: -this.heightPx / 2 - 200,
                    to: this.getTilePositionOnBoard(t).y
                },
                ease: Phaser.Math.Easing.Bounce.Out
            })
            // delay += Phaser.Math.Between(0, 100);
        })

        // Events
        this.each((tile: Tile) => {
            tile.on('pointerdown', this.onPointerDown.bind(this, tile));
        })
    }

    selectedTiles: Array<Tile> = [];

    public onPointerDown(tile: Tile) {

        // If the grid is not interactive, nothing to do here
        if (!this.interactive) {
            return;
        }
        // If this tile is selected, unselect it
        if (tile.isSelected) {
            tile.unselect();
            // remove it from the selectedTiles array
            let index = this.selectedTiles.indexOf(tile);
            this.selectedTiles.splice(index, 1);
            return;
        }

        // If this tile is not selected, select it
        tile.select();

        // Add this tile to the selected tiles array
        this.selectedTiles.push(tile);

        // If there are less than 2 selected tiles, return
        if (this.selectedTiles.length < 2) {
            return;
        }

        this.scene.game.events.emit(Constants.EVENTS.MOVE_DONE)

        // Remove the two first tiles from the selected array
        let tile1 = this.selectedTiles.shift();
        let tile2 = this.selectedTiles.shift();

        if (typeof tile1 === 'undefined' || typeof tile2 === 'undefined') {
            return;
        }

        // If the two tiles cannot be matched, unselected them after a while
        if (!this.canMatch(tile1, tile2)) {
            this.scene.time.addEvent({
                delay: 500,
                callback: () => {
                    tile1.unselect();
                    tile2.unselect();
                }
            })
            return;
        }
        // Then find a path between the two tiles
        let path = this.findPath(tile1.row, tile1.col, tile2.row, tile2.col);

        // If no path can be found, unselect both tiles after few seconds
        if (!path) {
            this.scene.time.addEvent({
                delay: 500,
                callback: () => {
                    tile1.unselect();
                    tile2.unselect();
                }
            })
            return;
        }

        // If a path can be found, draw it
        let graphics = this.displayPath(path, tile1, tile2);

        // Update the grid by removing both tiles                    
        this.setTile(tile1.row, tile1.col, null);
        this.setTile(tile2.row, tile2.col, null);

        this.scene.game.events.emit(Constants.EVENTS.CORRECT_MOVE_DONE, tile1, tile2)

        // Then make them disapear
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                graphics.destroy();
                tile1.destroy();
                tile2.destroy();
            }
        });

        // Check if the game is finished
        if (this.isFinished()) {
            console.log("GAME FINISHED");
            this.scene.game.events.emit(Constants.EVENTS.GAME_FINISHED);
            return;
        }

        // Check if there are still pairs to match
        let hint = this.getHints(false);

        if (hint.length === 0) {
            console.log("NO MORE MOVES - SHUFFLING");

            this.interactive = false;
            this.scene.time.addEvent({
                delay: 500,
                callback: () => {
                    this.scene.game.events.emit(Constants.EVENTS.SHUFFLING);
                    this.shuffleboard();
                    this.doForAllTiles(t => t.hideImage());
                }
            })

            this.scene.time.addEvent({
                delay: 2500,
                callback: () => {
                    this.updateBoard();
                    this.doForAllTiles(t => t.showImage());
                    this.scene.game.events.emit(Constants.EVENTS.SHUFFLING_DONE);
                    this.interactive = true;
                }
            })
        }
    }

    /**
     * Returns true if the game is finished : all tiles are matched
     */
    public isFinished() {
        return this.getAllTiles(t => t !== null).length === 0;
    }

    /**
     * Returns all tiles corresponding to the given predicate
     */
    public getAllTiles(predicate: (t: Tile) => boolean): Tile[] {
        let tiles = [];

        for (let row of this.tiles) {
            for (let tile of row) {
                if (predicate(tile)) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }

    /**
     * Returns a number representation of this grid with numbers
     */
    toString(): Array<Array<string>> {
        let strings = [];

        for (let row of this.tiles) {
            let rowString = [];
            for (let tile of row) {
                rowString.push(tile.tileid);
            }
            strings.push(rowString);
        }
        return strings;
    }

    /**
     * Exectute the given action on each non null tile corresponding to the given predicate
     */
    public doForAllTiles(action: (t: Tile) => void, predicate?: (t: Tile) => boolean) {
        for (let row of this.tiles) {
            for (let tile of row) {
                if (tile) {
                    if (predicate) {
                        if (predicate(tile)) {
                            action(tile);
                        } // else the tile does not match the predicate, nothing to do
                    } else {
                        action(tile);
                    }
                }
            }
        }
    }


    /** 
     * TODO check jokers
     **/
    public canMatch(tile1: Pick<Tile, 'tileid'>, tile2: Pick<Tile, 'tileid'>): boolean {
        return tile1 !== tile2 && tile1.tileid === tile2.tileid;
    }

    /**
     * Returns the list of all possible moves availble in the grid.
     */
    public getHints(full: boolean = true): Array<{ t1: Tile, t2: Tile, path: Path }> {
        let paths: Array<{ t1: Tile, t2: Tile, path: Path }> = [];

        // First copy the grid
        let copy = [];

        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.cols; j++) {
                let tileclone = this.get(i, j);
                if (tileclone) {
                    copy.push({ row: i, col: j, tileid: tileclone.tileid, marked: false });
                }
            }
        }

        // Then find all possible paths in the copy
        for (let obj of copy) {
            // If this tile has already been checked, continue
            if (obj.marked) {
                continue;
            }

            obj.marked = true;
            // Otherwise, find a path from this tile for all other tiles
            for (let obj2 of copy) {
                if (obj2.marked) {
                    continue;
                }
                if (!this.canMatch(obj, obj2)) {
                    continue;
                }
                let path = this.findPath(obj.row, obj.col, obj2.row, obj2.col);
                if (path) {
                    paths.push({ t1: this.get(obj.row, obj.col), t2: this.get(obj2.row, obj2.col), path: path });

                    // If we want only one hint, return the found path
                    if (!full) {
                        return paths;
                    }
                }
            }
        }

        return paths;
    }

    /**
     * Shuffle the grid of tiles, but do not move the empty positions.
     * Check if at least one move is possible.
     * If the 'update' parameter is set to true, the tiles are moved to their new positions
     */
    public shuffleboard(update: boolean = false) {
        this._shuffleboard();
        let hint = this.getHints(false);
        while (hint.length === 0) {
            this._shuffleboard();
            hint = this.getHints(false);
        }
        if (update) {
            this.updateBoard();
        }
    }

    /**
     * Shuffle the grid of tiles in place, but do not move the empty positions.
     * Does not check if there is at least one move to do.
     */
    private _shuffleboard() {
        // array to shuffle
        let arrayToShuffle = [];
        for (let arr of this.tiles) {
            arrayToShuffle = arrayToShuffle.concat(arr.filter((tile) => tile != null));
        }

        // Shuffle array
        let fisherYates = (array) => {
            let i = 0
                , j = 0
                , temp = null;

            for (i = array.length - 1; i > 0; i -= 1) {
                j = Math.floor(Math.random() * (i + 1))
                temp = array[i]
                array[i] = array[j]
                array[j] = temp
            }
        }
        fisherYates(arrayToShuffle);

        // Place it back in the tile array
        for (let row = 0; row < this.size.rows; row++) {
            for (let col = 0; col < this.size.cols; col++) {
                if (this.get(row, col) !== null) {
                    let tile = arrayToShuffle[0];
                    tile.row = row;
                    tile.col = col;
                    this.tiles[row][col] = tile;
                    arrayToShuffle.shift();
                }
            }
        }
    }

    /**
     * Update tiles to their correct position according to their row and col attributes.
     */
    public updateBoard() {

        // Unselect all tiles if any are selected
        this.doForAllTiles(t => t.unselect());

        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.cols; j++) {
                let tile = this.get(i, j);
                if (tile) {
                    tile.x = j * this.tileWidth + Grid.GUTTER_SIZE * j;
                    tile.y = i * this.tileHeight + Grid.GUTTER_SIZE_H * i;
                }
            }
        }
        this.each(tile => {
            tile.x -= this.widthPx / 2 - this.tileWidth / 2;
            tile.y -= this.heightPx / 2 - this.tileHeight / 2;
        });
    }

    public get widthPx(): number {
        return this.size.cols * this.tileWidth + (this.size.cols - 1) * Grid.GUTTER_SIZE;
    }

    public get heightPx(): number {
        return this.size.rows * this.tileHeight + (this.size.rows - 1) * Grid.GUTTER_SIZE_H;
    }

    public getTilePositionOnBoard(t: Tile): { x: number, y: number } {
        let i = t.row;
        let j = t.col;

        return {
            x: j * this.tileWidth + Grid.GUTTER_SIZE * j - this.widthPx / 2 + this.tileWidth / 2,
            y: i * this.tileHeight + Grid.GUTTER_SIZE_H * i - this.heightPx / 2 + this.tileHeight / 2
        };
    }


    /**
     * Add a tile to the board memory. If the tile is not null, it will be added to the grid.
     */
    public setTile(row: number, col: number, cell: Tile): void {
        this.tiles[row][col] = cell;
        if (cell) {
            this.add(cell);
        }
    }

    /**
     * Returns the tile corresponding to the given row and column.
     */
    public get(row: number, col: number): Tile {
        if (this._isValidPosition(row, col)) {
            return this.tiles[row][col];
        }
        return null;
    }

    /**
     * Returns true if the given position is in the grid OR 
     * if the position is around the grid.
     */
    private _isValidPositionWithOutline(r: number, c: number): boolean {
        return r >= -1
            && c >= -1
            && r <= this.size.rows
            && c <= this.size.cols
    }
    /**
     * Returns true if the given position is in the grid
     */
    private _isValidPosition(r: number, c: number): boolean {
        return r >= 0
            && c >= 0
            && r < this.size.rows
            && c < this.size.cols
    }

    /**
     * Returns the path between two tiles.
     * If no path is available, returns null;
     */
    public findPath(
        t1row: number, t1col: number,
        t2row: number, t2col: number
    ): Path {

        // let t1row = t1.row;
        // let t1col = t1.col;
        // let t2row = t2.row;
        // let t2col = t2.col;

        // if (t1 === t2) {
        //     // same tile, bye bye
        //     return null;
        // }
        // if (t1.tileid !== t2.tileid) {
        //     return null;
        // }
        let simplepath = this._findSimplePath(t1row, t1col, t2row, t2col);
        if (simplepath) {
            return simplepath;
        }
        // 2 corners paths
        // Find paths of 3 segments
        let dx = [1, 0, -1, 0];
        let dy = [0, 1, 0, -1];

        for (let i = 0; i < 4; ++i) {

            let tempX = t1row + dx[i];
            let tempY = t1col + dy[i];
            while (this._isValidPositionWithOutline(tempX, tempY) && this.get(tempX, tempY) === null) {
                let simplePath = this._findSimplePath(tempX, tempY, t2row, t2col);

                if (simplePath) {
                    simplePath.addFirst(t1row, t1col);
                    return simplePath;
                }
                tempX += dx[i];
                tempY += dy[i];
            }
        }
        return null;

    }

    /**
     * Returns true if a simple line path can be done between the two given tiles.
     * For this, t1 and t2 must be on the same row or column, and all tiles between them
     * must be empty.
     */
    private _canMakeSimpleLinePath(t1Row, t1Col, t2Row, t2Col): boolean {

        // same line
        if (t1Row === t2Row) {
            // From the farther on the left to the farther on the right
            let startTileCol = t1Col < t2Col ? t1Col : t2Col;
            let endTileCol = t1Col > t2Col ? t1Col : t2Col;
            // For each column
            for (let i = startTileCol + 1; i < endTileCol; i++) {
                // If a tile in the row between them is not null, return false;
                if (this.get(t1Row, i) !== null) {
                    return false;
                }
            }
            // The two tiles are on the same row, and all tiles between them are null
            return true;
        }
        // same col
        if (t1Col === t2Col) {
            // From the farther on the left to the farther on the right
            let startTile = t1Row < t2Row ? t1Row : t2Row;
            let endTile = t1Row > t2Row ? t1Row : t2Row;
            // For each row
            for (let i = startTile + 1; i < endTile; i++) {
                // If a tile in the row between them is not null, return false;
                if (this.get(i, t1Col) !== null) {
                    return false;
                }
            }
            // The two tiles are on the same col, and all tiles between them are null
            return true;
        }
        // The two tiles are not on the same row or the same column;
        return false;
    }

    /**
     * Returns the first found path between two tiles. If no path is available, returns null;
     */
    private _findSimplePath(t1row, t1col, t2row, t2col): Path {

        // Simple line path
        if (this._canMakeSimpleLinePath(t1row, t1col, t2row, t2col)) {
            let path = new Path();
            path.add(t1row, t1col).add(t2row, t2col);
            return path;
        }

        // Two segments paths
        let crossroad1 = this.get(t1row, t2col);
        let crossroad2 = this.get(t2row, t1col);
        if (crossroad1 === null
            && this._canMakeSimpleLinePath(t1row, t1col, t1row, t2col)
            && this._canMakeSimpleLinePath(t1row, t2col, t2row, t2col)) {
            let path = new Path();
            path.add(t1row, t1col).add(t1row, t2col).add(t2row, t2col);
            return path;
        }
        if (crossroad2 === null
            && this._canMakeSimpleLinePath(t1row, t1col, t2row, t1col)
            && this._canMakeSimpleLinePath(t2row, t1col, t2row, t2col)) {
            let path = new Path();
            path.add(t1row, t1col).add(t2row, t1col).add(t2row, t2col);
            return path;
        }
        return null;
    }

    /**
     * The grid is centered on the given point
     * @param x 
     * @param y 
     */
    public centeredOn(x: number, y?: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Display the path given in parameter
     * @param p The path to be displayed
     */
    public displayPath(path: Path, tile1: Tile, tile2: Tile): Phaser.GameObjects.Graphics {

        let graphics = this.scene.make.graphics({
            x: 0,
            y: 0,
            add: false
        });
        graphics.lineStyle(15 * ratio, 0xff0000);
        this.add(graphics);

        let points = path.points.map((pathpoint: { row: number, col: number }) => {
            let p = this.convertColRowToXY(pathpoint.row, pathpoint.col);

            p.x -= this.widthPx / 2 - this.tileWidth / 2;
            p.y -= this.heightPx / 2 - this.tileHeight / 2;
            return p;
        })

        graphics.strokePoints(points, false, false);

        if (!tile1.isSelected) {
            tile1.highlight();
        }
        if (!tile2.isSelected) {
            tile2.highlight();
        }

        // Both tile should come at the top of the path
        this.bringToTop(tile1);
        this.bringToTop(tile2);

        return graphics;
    }

    /**
     * Converts row and col in the grid to (x,y) coordinates
     * @param row 
     * @param col 
     */
    public convertColRowToXY(row: number, col: number): Phaser.Geom.Point {
        return new Phaser.Geom.Point(
            col * this.tileWidth + col * Grid.GUTTER_SIZE,
            row * this.tileHeight + row * Grid.GUTTER_SIZE_H,
        );
    }
}


function getBestScaleForCols(tileWidth: number, cols: number) {
    // Find best scale for this number of columns
    let availableSpace = bounds.width - 45 * 2 * ratio;
    let cardWidth = tileWidth + Grid.GUTTER_SIZE;
    let bestCardWidth = availableSpace / cols;

    let scale = bestCardWidth / cardWidth;
    return scale;
}

function getBestScaleForLines(tileHeight: number, rows: number): number {
    let availableSpace = bounds.height - 90 * 2 * ratio;
    let cardHeight = tileHeight + Grid.GUTTER_SIZE_H;
    let bestCardHeight = availableSpace / rows;

    let scale = bestCardHeight / cardHeight;
    return scale;
}

/**
 * Returns the best scale for tile according to the number of tiles and the available space
 * @param tilesize 
 * @param gridsize 
 * @returns 
 */
export function getBestScaleForTiles(
    tilesize: {
        tileWidth: number,
        tileHeight: number
    },
    gridsize: {
        cols: number,
        rows: number
    }
): number {
    return Phaser.Math.Clamp(
        ratio * Math.min(
            getBestScaleForCols(tilesize.tileWidth, gridsize.cols),
            getBestScaleForLines(tilesize.tileHeight, gridsize.rows)
        ),
        0.5,
        1.75
    );
}