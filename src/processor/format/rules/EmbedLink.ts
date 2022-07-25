import { posix } from 'path';
import { isMarkdown } from '../../../utils/isMarkdown';
import { State } from '../state';
const { basename, join } = posix;

export default function embedlink(state: State): boolean {
    const content = state.content;
    const embedLinkPattern =
        /!\[(?<alias>[^\[\]\n]*?)?(?:\|(?<width>\d+)(?:x(?<height>\d+))?)?\]\((?<linkPath>[^\(\)\n]+?)(?<subPath>#[^\|#\(\)\n]*?)?\)/uy;
    embedLinkPattern.lastIndex = state.left;
    const exec = embedLinkPattern.exec(content);
    if (exec === null || exec.groups === undefined) return false;
    let { alias = '', linkPath, subPath = '', width, height } = exec.groups;
    let replace;
    if (isMarkdown(linkPath)) {
        linkPath = join('/docs', linkPath);
        replace = `\n@include(${linkPath})\n`;
    } else {
        if (!linkPath.startsWith('http')) linkPath = join('/', basename(linkPath));
        if (width !== undefined) {
            replace = `![${alias}](${linkPath} =${width}x${height ?? ''})`;
        } else {
            replace = `![${alias}](${linkPath}${subPath})`;
        }
    }
    state.content = content.slice(0, state.left) + replace + content.slice(state.left + exec[0].length);
    state.left += replace.length;
    state.right = state.right - exec[0].length + replace.length;
    // console.log('embed link');
    // console.log('match:', exec[0]);
    // console.log('replace:', replace);
    return true;
}
