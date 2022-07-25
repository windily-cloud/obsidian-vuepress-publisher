import { State } from 'processor/format/state';
import { basename, posix } from 'path';
const { extname, join } = posix;

export default function wikiLink(
    state: State,
    getPath: (linkPath: string, sourcePath: string) => string = (linkPath: string, sourcePath: string) => {
        const file = app.metadataCache.getFirstLinkpathDest(linkPath, sourcePath);
        if (file === null) return linkPath;
        else return file.path;
    }
): boolean {
    const content = state.content;
    const wikiLinkPattern = /\[\[(?<linkPath>[^\|#\n]*?)(?<subPath>#[^\|#\n]*?)?(?:\|(?<alias>[^\|\n]*?))?\]\]/uy;
    wikiLinkPattern.lastIndex = state.left;
    const exec = wikiLinkPattern.exec(content);
    if (exec === null || exec.groups === undefined) return false;
    let { linkPath, subPath = '', alias } = exec.groups;
    if (extname(linkPath) == '') linkPath += '.md';
    linkPath = getPath(linkPath, state.env.sourcePath);
    linkPath = join('/docs', linkPath);
    alias = alias ?? basename(linkPath, '.md');
    const replace = `[${alias}](${linkPath}${subPath})`;
    state.content = content.slice(0, state.left) + replace + content.slice(state.left + exec[0].length);
    state.left += exec[0].length;
    state.right = state.right - exec[0].length + replace.length;
    // console.log('wiki link');
    // console.log('match:', exec[0]);
    // console.log('replace:', replace);
    return true;
}
