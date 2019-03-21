import {Location} from './Location';

export class Token {
    constructor(
        public type: string,
        public lexeme: string,
        public values: {[key: string]: string},
        public location: Location
    ) {}

    formatValues() {
        const formatted: string[] = [];

        const valueNames = Object.keys(this.values);
        for (let i = 0; i < valueNames.length; i++) {
            formatted.push(`${valueNames[i]}=${this.values[valueNames[i]]}`);
        }

        return formatted.join(', ');
    }

    toString() {
        return `${this.type.toString()}[${this.formatValues()}] ${this.lexeme} at ${this.location}`;
    }
}

