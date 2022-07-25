import { State } from '../state';

export default function codeBlock(state: State): boolean {
    const content = state.content;
    const codeBlockPattern = /(?<separator>```+)(?<language>.*)\n(?<code>[\s\S]+?)\n\k<separator>/uy;
    codeBlockPattern.lastIndex = state.left;
    const exec = codeBlockPattern.exec(content);
    if (exec === null || exec.groups === undefined) return false;
    state.left += exec[0].length;
    // console.log('code block');
    // console.log('match:', exec[0]);
    return true;
}
