import Formatter from './formatter';

export class State {
    env: {
        sourcePath?: string;
    };
    content: string;
    left: number;
    right: number;
    formatter: Formatter;
    constructor(formatter: Formatter, content: string, sourcePath?: string, left?: number, right?: number) {
        this.formatter = formatter;
        this.content = content;
        this.env = { sourcePath };
        this.left = left ?? 0;
        this.right = right ?? content.length;
    }
}
