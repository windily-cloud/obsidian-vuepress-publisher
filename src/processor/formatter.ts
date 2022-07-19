import { VuepressPublisherSettings } from './../main';
import { Failure, DataviewApi, getAPI } from 'obsidian-dataview';
import { posix } from 'path';
import yaml from 'js-yaml';

const { dirname, basename, join } = posix;

function isMarkdown(filePath: string) {
    return posix.extname(filePath) === '' || posix.extname(filePath) === '.md';
}

export default class Formatter {
    constructor(public settings: VuepressPublisherSettings) {}

    async format(content: string, sourcePath: string) {
        content = content.split('\n').join('\n\n');
        content = this.replaceLink(content, sourcePath);
        content = this.replaceAdmonition(content);
        content = await this.replaceDataview(content);
        content = this.replaceChart(content);
        return content;
    }

    replaceLink(
        content: string,
        sourcePath = '',
        getLink: (linkPath: string, sourcePath: string) => string = (linkPath: string, sourcePath: string) => {
            const toFile = app.metadataCache.getFirstLinkpathDest(linkPath, sourcePath);
            if (toFile === null) return linkPath;
            else return toFile.path;
        }
    ) {
        return content
            .replace(
                /(?<!!)\[(?<alias>[^\[\]\n]*?)?\]\((?<linkPath>[^\(\)\n]+?)(?<subPath>#[^\|#\(\)\n]*?)?\)/gu,
                (...match: any[]) => {
                    const groups = match.pop();
                    let { linkPath, subPath = '', alias = '' } = groups;
                    if (!isMarkdown(linkPath)) {
                        linkPath = join('/', basename(linkPath));
                        return `[${alias}](${linkPath + subPath})`;
                    } else return match[0];
                }
            )
            .replace(
                /!\[(?<alias>[^\[\]\n]*?)?\]\((?<linkPath>[^\(\)\n]+?)(?<subPath>#[^\|#\(\)\n]*?)?\)/gu,
                (...match: any[]) => {
                    const groups = match.pop();
                    let { linkPath, subPath = '', alias = '' } = groups;
                    if (!isMarkdown(linkPath)) {
                        linkPath = join('/', basename(linkPath));
                        return `![${alias}](${linkPath + subPath})`;
                    } else return match[0];
                }
            )
            .replace(
                /!\[\[(?<linkPath>[^\|\[\]#\n]*?)(?<subPath>#[^\|\[\]#\n]*?)?(?:\|(?<alias>[^\|\[\]\n]*?))?\]\]/gu,
                (...match: any[]) => {
                    const groups = match.pop();
                    let { linkPath, subPath = '', alias } = groups;
                    if (isMarkdown(linkPath)) {
                        linkPath = join('/', dirname(linkPath), basename(linkPath, '.md'));
                        return `\n@include(${linkPath})\n`;
                    } else {
                        linkPath = join('/', basename(linkPath));
                        alias = alias ?? basename(linkPath);
                        if (alias.match(/^(?<width>\d+)(?:x(?<height>\d+))?$/u)) {
                            const size = alias.includes('x') ? alias : alias + 'x';
                            return `![${basename(linkPath)}](${linkPath} =${size})`;
                        }
                        return `![${alias}](${linkPath + subPath})`;
                    }
                }
            )
            .replace(
                /(?<!!)\[\[(?<linkPath>[^\|#\n]*?)(?<subPath>#[^\|#\n]*?)?(?:\|(?<alias>[^\|\n]*?))?\]\]/gu,
                (...match: any[]) => {
                    const groups = match.pop();
                    let { linkPath, subPath = '', alias } = groups;
                    if (isMarkdown(linkPath)) {
                        alias = alias ?? linkPath;
                        linkPath = getLink(linkPath, sourcePath);
                        linkPath = join('/', dirname(linkPath), basename(linkPath, '.md'));
                        return `[${alias}](${linkPath + subPath})`;
                    } else {
                        linkPath = join('/', basename(linkPath));
                        alias = alias ?? basename(linkPath);
                        return `[${alias}](${linkPath + subPath})`;
                    }
                }
            );
    }

    replaceAdmonition(content: string): string {
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
        return content.replace(
            /(```+)ad-(?<type>.+?)\n(?:title: (?<title>.+?)\n)?(?<code>[\s\S]*?)\n\1/gu,
            (...match: any[]) => {
                const groups = match.pop();
                let { type, title = '', code } = groups;
                type = admonitionToVuepress.get(type);
                if (type === undefined) {
                    return match[0];
                } else {
                    if (title !== '') title = ' ' + title;
                    return `::: ${type}${title}\n${code}\n:::`;
                }
            }
        );
    }

    async replaceDataview(content: string, dv: DataviewApi = getAPI()): Promise<string> {
        if (dv === undefined) return content;
        let ret = '';
        let match: RegExpMatchArray;
        let i = 0;
        const dataviewPattern = /(?<separator>`*)dataview\n(?<code>[\s\S]*?)\n?\k<separator>/gu;
        while ((match = dataviewPattern.exec(content)) !== null) {
            ret += content.slice(i, match.index);
            const { code } = match.groups;
            const res = await dv.queryMarkdown(code);
            if (res.successful) {
                ret += res.value;
            } else {
                ret += `<div class="dataview dataview-error" style="width: 100%; min-height: 150px; display: flex; align-items: center; justify-content: center;">
<pre>Dataview: ${(res as Failure<any, any>).error}</pre>
</div>`;
            }
            i = dataviewPattern.lastIndex;
        }
        ret += content.slice(i);
        console.log(content.slice(0, i));
        return ret;
    }

    replaceChart(content: string): string {
        return content.replace(/(?<separator>`*)chart\n(?<content>[\s\S]*?)\n?\k<separator>/gu, (...match: any[]) => {
            const groups = match.pop();
            const { separator, content } = groups;
            let data: any;
            try {
                data = yaml.load(content.replace(/	/g, '    '));
            } catch (error) {
                return `<div class="chart-error" style="padding: 1rem;border-radius: 1rem;">
<b> Couldn't render Chart:</b>
<pre><code>${error.toString()}</code></pre>
</div>`;
            }

            console.log(data);
            if (!data.id) {
                if (!data || !data.type || !data.labels || !data.series) {
                    return `<div class="chart-error" style="padding: 1rem;border-radius: 1rem;">
<b> Couldn't render Chart:</b>
<pre><code>Missing type, labels or series</code></pre>
</div>`;
                }
            }
            return `::: chart

\`\`\`json
${JSON.stringify(content, null, 4)}
\`\`\`

:::
`;
        });
    }
}
