import { State } from '../state';
import { posix } from 'path';
import { isMarkdown } from '../../../utils/isMarkdown';
const { basename, join } = posix;

export default function embedWikiLink(state: State): boolean {
    const content = state.content;
    const embedWikiLinkPattern =
        /!\[\[(?<linkPath>[^\|\[\]#\n]*?)(?<subPath>#[^\|\[\]#\n]*?)?(?:\|(?<alias>[^\|\[\]\n]*?))?\]\]/uy;
    embedWikiLinkPattern.lastIndex = state.left;
    const exec = embedWikiLinkPattern.exec(content);
    if (exec === null || exec.groups === undefined) return false;
    let { linkPath, subPath = '', alias = '' } = exec.groups;
    let replace: string;
    if (isMarkdown(linkPath)) {
        replace = `\n@include(${linkPath})\n`;
    } else {
        linkPath = join('/', basename(linkPath));
        const sizePattern = /^(?<width>\d+)(?:x(?<height>\d+))?$/u;
        const match = alias.match(sizePattern);
        if (match && match.groups) {
            const { width, height = '' } = match.groups;
            replace = `![${basename(linkPath)}](${linkPath} =${width}x${height})`;
        } else {
            replace = `![${alias}](${linkPath}${subPath})`;
        }
    }
    state.content = content.slice(0, state.left) + replace + content.slice(state.left + exec[0].length);
    state.left += replace.length;
    console.log('EmbedWikiLink', state.content, replace);
    return true;
}
