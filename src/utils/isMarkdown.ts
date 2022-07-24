import { posix } from 'path';
const { extname } = posix;

export function isMarkdown(path: string) {
    return !path.startsWith('http') && (extname(path) == '.md' || extname(path) == '');
}
