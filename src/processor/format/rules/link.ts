import { State } from './../state';
import { posix } from 'path';
import { isMarkdown } from './../../../utils/isMarkdown';
const { basename, join } = posix;

export default function link(
    state: State,
    getPath: (linkPath: string, sourcePath: string) => string = (linkPath: string, sourcePath: string) => {
        const file = app.metadataCache.getFirstLinkpathDest(linkPath, sourcePath);
        if (file === null) return linkPath;
        else return file.path;
    }
): boolean {
    const content = state.content;
    const linkPattern = /(?<!!)\[(?<alias>[^\[\]\n]*?)?\]\((?<linkPath>[^\(\)\n]+?)(?<subPath>#[^\|#\(\)\n]*?)?\)/uy;
    linkPattern.lastIndex = state.left;
    const exec = linkPattern.exec(content);
    if (exec === null || exec.groups === undefined) return false;
    let { alias = '', linkPath, subPath = '' } = exec.groups;
    let replace = '';
    if (!linkPath.startsWith('http')) {
        if (isMarkdown(linkPath)) {
            linkPath = join('/docs', getPath(linkPath, state.env.sourcePath));
        } else {
            linkPath = join('/', basename(linkPath));
        }
    }
    replace = `[${alias}](${linkPath}${subPath})`;
    state.content = content.slice(0, state.left) + replace + content.slice(state.left + exec[0].length);
    state.left = state.left + replace.length;
    state.right = state.right - exec[0].length + replace.length;
    // console.log('link');
    // console.log('match:', exec[0]);
    // console.log('replace:', replace);
    return true;
}
