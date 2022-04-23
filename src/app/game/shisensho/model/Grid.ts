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

        let scale = this.getBestScaleForTiles();
        console.log(scale);


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
        console.log(tiles.map(t => t.tileid))

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
        this.scale = ratio * this.getBestScaleForTiles();

        // let debug = new Debugger(this.scene);
        // this.each(t => {
        //     debug.point(
        //         this.convertColRowToXY(t.row, t.col), this)
        // })

        // shuffle the array
        this.shuffleboard();

        this.updateBoard();


        // Events
        // let selectedTile: Tile = null;

        let selectedTiles: Array<Tile> = [];

        this.each((tile: Tile) => {
            tile.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                // If the grid is not interactive, nothing to do here
                if (!this.interactive) {
                    return;
                }
                // If this tile is selected, unselect it
                if (tile.isSelected) {
                    tile.unselect();
                    // remove it from the selectedTiles array
                    let index = selectedTiles.indexOf(tile);
                    selectedTiles.splice(index, 1);
                    return;
                }

                // If this tile is not selected, select it
                tile.select();

                // Add this tile to the selected tiles array
                selectedTiles.push(tile);

                // If there are less than 2 selected tiles, return
                if (selectedTiles.length < 2) {
                    return;
                }

                // Remove the two first tiles from the selected array
                let tile1 = selectedTiles.shift();
                let tile2 = selectedTiles.shift();

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
                let graphics = this.displayPath(path);

                // Update the grid by removing both tiles                    
                this.setTile(tile1.row, tile1.col, null);
                this.setTile(tile2.row, tile2.col, null);

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
                    return;
                }

                this.emit(Constants.EVENTS.GRID_CHECK_HINTS);
            });
        })

        this.addListener(Constants.EVENTS.GRID_CHECK_HINTS, () => {

            // Check if there are still pairs to match
            let hint = this.getHints(false);
            console.log("Hints", hint);
            if (hint.length === 0) {
                console.log("NO MORE MOVES - SHUFFLING");
                this.interactive = false;

                while (hint.length === 0) {
                    this.shuffleboard();
                    hint = this.getHints(false);
                    console.log("Hints", hint);
                }
                this.scene.time.addEvent({
                    delay: 2000,
                    callback: () => {
                        this.updateBoard();
                        this.interactive = true;
                    }
                })
            }

        });
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
    private getAllTiles(predicate: (t: Tile) => boolean) {
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
     * Display the path between them and destroy both cards.
     */
    private matchTiles(tile1: Tile, tile2: Tile) {

    }

    // TODO check jokers
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
     */
    public shuffleboard() {
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

        // this._updateGrid();
    }

    /**
     * Update tiles to their correct position according to their row and col attributes.
     */
    public updateBoard() {
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.cols; j++) {
                let tile = this.get(i, j);
                if (tile) {
                    tile.x = j * this.tileWidth + Grid.GUTTER_SIZE * j;
                    tile.y = i * this.tileHeight + Grid.GUTTER_SIZE_H * i;
                }
            }
        }
        this.each(c => {
            c.x -= this.widthPx / 2 - this.tileWidth / 2;
            c.y -= this.heightPx / 2 - this.tileHeight / 2;
        });
    }

    public get widthPx(): number {
        return this.size.cols * this.tileWidth + (this.size.cols - 1) * Grid.GUTTER_SIZE;
    }

    public get heightPx(): number {
        return this.size.rows * this.tileHeight + (this.size.rows - 1) * Grid.GUTTER_SIZE_H;
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
    public displayPath(path: Path): Phaser.GameObjects.Graphics {

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
        // this.add(poly);

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

    /**
     * Returns the best scaling for tiles to fit the grid.
     */
    private getBestScaleForTiles(): number {
        return Math.min(
            this._getBestScaleForCols(),
            this._getBestScaleForLines()
        );
    }

    private _getBestScaleForCols(): number {
        // Find best scale for this number of columns
        let availableSpace = bounds.width - 45 * 2 * ratio;
        let cardWidth = this.tileWidth + Grid.GUTTER_SIZE;
        let bestCardWidth = availableSpace / this.size.cols;

        let scale = bestCardWidth / cardWidth;
        return scale;
    }

    private _getBestScaleForLines(): number {
        let availableSpace = bounds.height - 45 * 2 * ratio;
        let cardHeight = this.tileHeight + Grid.GUTTER_SIZE_H;
        let bestCardHeight = availableSpace / this.size.rows;

        let scale = bestCardHeight / cardHeight;
        return scale;
    }
}