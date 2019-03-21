interface LOC {
    line: number;
    column: number;
}

export class Location {
    constructor(
        public start: LOC,
        public end: LOC
    ) {}

    toString() {
        return `[${this.start.line}:${this.start.column}-${this.end.line}:${this.end.column}]`;
    }
}