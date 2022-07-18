import { VuepressPublisherSettings } from './../main';
import { Failure, DataviewApi, getAPI } from 'obsidian-dataview';
import { posix } from 'path';

class Content {
    content: string;
    sourcePath: string;

    constructor(content: string, sourcePath: string = '') {
        this.content = content;
        this.sourcePath = sourcePath;
    }

    replaceExtended(regex: RegExp, replace: (match: RegExpMatchArray) => string): this {
        replace = replace.bind(this);
        for (let match of this.content.matchAll(regex)) {
            this.content = this.content.replace(match[0], replace(match));
        }
        return this;
    }
}

function isMarkdown(filePath: string) {
    return posix.extname(filePath) === '' || posix.extname(filePath) === '.md';
}

export default class Formatter {
    constructor(public settings: VuepressPublisherSettings) {}

    async format(content: string, filePath: string) {
        content = this.replaceLink(content, filePath);
        content = this.replaceAdmonition(content);
        content = await this.replaceDataview(content, getAPI());
    }

    replaceLink(
        content: string,
        filePath: string = '',
        getLink: (filePath: string, sourcePath: string) => string = (filePath: string, sourcePath: string) =>
            app.metadataCache.getFirstLinkpathDest(filePath, sourcePath).path
    ) {
        let settings = this.settings;
        return new Content(content, filePath)
            .replaceExtended(
                /(?<!!)\[(?<alias>[^\[\]]*)?\]\((?<filePath>[^\(\)]+)(?<subPath>#[^\|#\(\)]*)?\)/gu,
                function (match: RegExpMatchArray) {
                    let { filePath, subPath = '', alias = '' } = match.groups;
                    if (!isMarkdown(filePath)) {
                        filePath = posix.join('/', posix.basename(filePath));
                        return `[${alias}](${filePath + subPath})`;
                    } else return match[0];
                }
            )
            .replaceExtended(
                /!\[(?<alias>[^\[\]]*)?\]\((?<filePath>[^\(\)]+)(?<subPath>#[^\|#\(\)]*)?\)/gu,
                function (match: RegExpMatchArray) {
                    let { filePath, subPath = '', alias = '' } = match.groups;
                    if (!isMarkdown(filePath)) {
                        filePath = posix.join('/', posix.basename(filePath));
                        return `![${alias}](${filePath + subPath})`;
                    } else return match[0];
                }
            )
            .replaceExtended(
                /!\[\[(?<filePath>[^\|\[\]#]*)(?<subPath>#[^\|\[\]#]*)?(?:\|(?<alias>[^\|\[\]]*))?\]\]/gu,
                function (match: RegExpMatchArray) {
                    let { filePath, subPath = '', alias } = match.groups;
                    if (isMarkdown(filePath)) {
                        filePath = posix.join(settings.publishFolder, getLink(filePath, this.sourcePath));
                        return `\n@include{${filePath}}\n`;
                    } else {
                        filePath = posix.join('/', posix.basename(filePath));
                        alias = alias ?? posix.basename(filePath);
                        if (alias.match(/^(?<width>\d+)(?:x(?<height>\d+))?$/u)) {
                            let size = alias.includes('x') ? alias : alias + 'x';
                            return `![${posix.basename(filePath)}](${filePath} =${
                                alias.includes('x') ? alias : alias + 'x'
                            })`;
                        }
                        return `![${alias}](${filePath + subPath})`;
                    }
                }
            )
            .replaceExtended(
                /(?<!!)\[\[(?<filePath>[^\|#]*)(?<subPath>#[^\|#]*)?(?:\|(?<alias>[^\|]*))?\]\]/gu,
                function (match: RegExpMatchArray) {
                    let { filePath, subPath = '', alias } = match.groups;
                    if (isMarkdown(filePath)) {
                        alias = alias ?? filePath;
                        filePath = posix.join(settings.publishFolder, getLink(filePath, this.sourcePath));
                        return `[${alias}](${filePath + subPath})`;
                    } else {
                        filePath = posix.join('/', posix.basename(filePath));
                        alias = alias ?? posix.basename(filePath);
                        return `[${alias}](${filePath + subPath})`;
                    }
                }
            ).content;
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
        return new Content(content).replaceExtended(
            /(```+)ad-(?<type>[\S]+)\n(?:title: (?<title>.+)\n)?(?<content>[\s\S]*)\n\1/gu,
            function (match: RegExpMatchArray) {
                let { separator, type, title = '', content } = match.groups;
                type = admonitionToVuepress.get(type);
                if (type === undefined) {
                    return match[0];
                } else {
                    if (title !== '') title = ' ' + title;
                    return `::: ${type}${title}\n${content}\n:::`;
                }
            }
        ).content;
    }

    async replaceDataview(content: string, dv: DataviewApi): Promise<string> {
        if (dv === undefined) return content;
        const contentviewPattern = /(?<separator>`*)dataview\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (const match of content.matchAll(contentviewPattern)) {
            let { content } = match.groups;
            const res = await dv.queryMarkdown(content);
            if (res.successful) {
                content = content.replace(match[0], res.value);
            } else {
                content = content.replace(match[0], (res as Failure<string, string>).error);
            }
        }
        const contentviewJSPattern = /(?<separator>`*)dataviewjs\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (const match of content.matchAll(contentviewJSPattern)) {
            let { content } = match.groups;
            const res = await dv.queryMarkdown(content);
            if (res.successful) {
                content = content.replace(match[0], res.value);
            } else {
                content = content.replace(match[0], (res as Failure<string, string>).error);
            }
        }
        return content;
    }

    replaceChart(content: string, parseYaml: (yaml: string) => string): string {
        const chartPattern = /(?<separator>`*)chart\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (const match of content.matchAll(chartPattern)) {
            let { content } = match.groups;
            content = content.replace(
                match[0],
                `::: chart

\`\`\`json
${JSON.stringify(parseYaml(content), null, 4)}
\`\`\`

:::
`
            );
        }
        return content;
    }
}
