
export class Path {

    public points: Array<{ row: number, col: number }> = [];

    public add(row, col): Path {
        this.points.push({ row: row, col: col });
        return this;
    }

    public addFirst(row, col): Path {
        this.points.unshift({ row: row, col: col });
        return this;
    }
}