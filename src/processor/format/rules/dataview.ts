import { State } from '../state';
import { Failure, getAPI } from 'obsidian-dataview';

export default async function dataview(state: State): Promise<boolean> {
    const content = state.content;
    const dataviewPattern = /(?<separator>```+)dataview\n(?<code>[\s\S]*?)\n?\k<separator>/uy;
    dataviewPattern.lastIndex = state.left;
    const exec = dataviewPattern.exec(content);
    if (exec === null || exec.groups === undefined) return false;
    const { code } = exec.groups;
    const dv = getAPI();
    if (dv === undefined) return false;
    const result = await dv.queryMarkdown(code, state.env.sourcePath);
    let replace: string;
    if (result.successful) {
        replace = result.value;
    } else {
        replace = `<div class="dataview dataview-error" style="width: 100%; min-height: 150px; display: flex; align-items: center; justify-content: center;">
<pre>Dataview: ${(result as Failure<string, string>).error}</pre>
</div>`;
    }
    state.content = content.slice(0, state.left) + replace + content.slice(state.left + exec[0].length);
    state.left += replace.length;
    state.right = state.right - exec[0].length + replace.length;
    // console.log('dataview');
    // console.log('match:', exec[0]);
    // console.log('replace:', replace);
    return true;
}
