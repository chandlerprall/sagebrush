export class ScanError {
    constructor(
        private line: number,
        private column: number,
        private message: string
    ) {}

    toString() {
        return `${this.message} at ${this.line}:${this.column}`;
    }
}