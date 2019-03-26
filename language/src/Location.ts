export interface LineAndColumn {
    line: number;
    column: number;
}

export interface Index {
    index: number;
}

export class Location {
    constructor(
        public start: LineAndColumn | Index,
        public end: LineAndColumn | Index
    ) {}

    toString() {
        if (this.start.hasOwnProperty('line')) {
            return `[${(this.start as LineAndColumn).line}:${(this.start as LineAndColumn).column}-${(this.end as LineAndColumn).line}:${(this.end as LineAndColumn).column}]`;
        } else {
            return `[index ${(this.start as Index).index}-${(this.end as Index).index}]`;
        }
    }
}