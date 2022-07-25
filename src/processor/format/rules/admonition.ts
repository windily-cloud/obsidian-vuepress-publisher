import { State } from '../state';

const admonitionToVuepress = new Map<string, string>();
admonitionToVuepress.set('tip', 'tip');
admonitionToVuepress.set('hint', 'tip');
admonitionToVuepress.set('important', 'tip');
admonitionToVuepress.set('info', 'info');
admonitionToVuepress.set('todo', 'info');
admonitionToVuepress.set('warning', 'warning');
admonitionToVuepress.set('caution', 'warning');
admonitionToVuepress.set('attention', 'warning');
admonitionToVuepress.set('danger', 'danger');
admonitionToVuepress.set('error', 'danger');
admonitionToVuepress.set('note', 'note');

export default function admonition(state: State): boolean {
    const content = state.content;
    const admonitionPattern =
        /(?<separator>```+)ad-(?<type>.+?)\n+(?:title: (?<title>.+?)\n)?(?<code>[\s\S]*?)\n\k<separator>/uy;
    admonitionPattern.lastIndex = state.left;
    const exec = admonitionPattern.exec(content);
    if (exec === null || exec.groups === undefined) return false;
    let { type, title = '', code } = exec.groups;
    type = admonitionToVuepress.get(type);
    const replace = `::: ${type} ${title}\n${code}\n:::`;
    state.content = content.slice(0, state.left) + replace + content.slice(state.left + exec[0].length);
    state.left += replace.length;
    state.right = state.right - exec[0].length + replace.length;
    // console.log('admonition');
    // console.log('match:', exec[0]);
    // console.log('replace:', replace);
    return true;
}
