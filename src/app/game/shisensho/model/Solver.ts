import { Grid } from "./Grid";
import { Path } from "./Path";

type MiniTile = { row: number, col: number, value: string };

class Minigrid {

    public grid: Array<Array<string>> = [];


    constructor(public rows: number, public cols: number) {
    }

    static FromGrid(grid: Grid): Minigrid {
        let minigrid = new Minigrid(grid.size.rows, grid.size.cols);
        minigrid.grid = grid.toString();
        return minigrid;
    }

    get(r: number, c: number): string {
        if (r >= 0
            && c >= 0
            && r < this.rows
            && c < this.cols) {
            return this.grid[r][c];
        }
        return null;
    }

    /**
     * Removes the tile from the grid.
     * @param r row of the  tile
     * @param c col of the tile
     */
    remove(r: number, c: number): void {
        this.grid[r][c] = null;
    }

    canMatch(t1: MiniTile, t2: MiniTile): boolean {
        return !(t1.col === t2.col && t1.row === t2.row) && t1.value === t2.value;
    }

    isFinished(): boolean {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.get(i, j) !== null) {
                    return false;
                }
            }
        }
        return true;
    }

    clone(): Minigrid {
        let clone = new Minigrid(this.rows, this.cols);
        clone.grid = this.grid.slice();
        return clone;
    }

    /**
     * Returns true if the given position is in the grid OR 
     * if the position is around the grid.
     */
    private _isValidPositionWithOutline(r: number, c: number): boolean {
        return r >= -1
            && c >= -1
            && r <= this.rows
            && c <= this.cols
    }

    /**
     * Returns the path between two tiles.
     * If no path is available, returns null;
     */
    public findPath(
        t1row: number, t1col: number,
        t2row: number, t2col: number
    ): Path {


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
     * Returns the list of all possible moves availble in the grid.
     */
    public getHints(): Array<{ t1: MiniTile, t2: MiniTile }> {

        let paths: Array<{ t1: MiniTile, t2: MiniTile }> = [];

        // First copy the grid
        let copy: Array<{ row: number, col: number, value: string, marked: boolean }> = [];

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let tileclone = this.get(i, j);
                if (tileclone) {
                    copy.push({ row: i, col: j, value: tileclone, marked: false });
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
                    paths.push({
                        t1: { row: obj.row, col: obj.col, value: obj.value },
                        t2: { row: obj2.row, col: obj2.col, value: obj2.value },
                    });
                }
            }
        }

        return paths;
    }

}

export class Solver {

    constructor() {
    }

    static Solve(grid: Grid) {
        let minigrid = Minigrid.FromGrid(grid);

        let solver = new Solver();
        return solver._solve(minigrid);
    }

    private _solve(minigrid: Minigrid): Array<{ t1: MiniTile, t2: MiniTile }> {

        // Get all possibles solutions
        let allMoves = minigrid.getHints();

        // If no moves, the grid is not solvable. Returns null.
        if (allMoves.length === 0) {
            return null
        }

        for (let move of allMoves) {
            let newgrid = this.removeSolution(minigrid, move);

            if (newgrid.isFinished()) {
                // The grid is solvable
                return [move];
            }

            let solution = this._solve(newgrid);

            if (solution !== null) {
                return [move, ...solution];
            }
        }

        return null;

    }

    removeSolution(minigrid: Minigrid, move: { t1: MiniTile, t2: MiniTile }): Minigrid {
        // Clone the given minigrid
        let grid = minigrid.clone();
        // remove the two tiles from the grid
        grid.remove(move.t1.row, move.t1.col);
        grid.remove(move.t2.row, move.t2.col);

        return grid;
    }

}