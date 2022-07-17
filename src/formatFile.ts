import { parseYaml } from "obsidian";
import {VuepressPublisherSettings} from './main';
import { relative, dirname, basename, join } from "path";
import { Failure, getAPI } from "obsidian-dataview";

export class Formatter {
    settings: VuepressPublisherSettings

    constructor(settings: VuepressPublisherSettings) {
        this.settings = settings;
    }
    async formatFile(content: string, filePath: string): Promise<string> {
        content = await this.replacecontentView(content, filePath);
        content = this.replaceAdmonition(content);
        content = this.replaceChart(content);
        content = this.replaceEChart(content);
        content = this.replaceWikiLinks(content, filePath);
        content = this.replaceAssetsLinks(content);
        return content;
    }

    replaceWikiLinks(content: string, filePath: string): string {
        let wikiLinkPattern = /\[\[(?<path>[^|]*?)(?:\|(?<text>[^|]*?))?\]\]/gu;

        for (let match of content.matchAll(wikiLinkPattern)) {
            let { path, text } = match.groups;
            let linkPattern = /(?<link>(?:[^#]*))(?<title>#[^#]*)?/u;
            let { link, title } = path.match(linkPattern).groups;
            let toFile = app.metadataCache.getFirstLinkpathDest(link, filePath);
            let toFilePath = join(relative(filePath, dirname(toFile.path)), basename(filePath, ".md"));
            content = content.replace(match[0], `[${text ? text : path}](${toFilePath + (title ?? "")})`);
        }
        return content;
    }

    replaceAssetsLinks(content: string): string {
        let linkPattern = /\[(?<text>[^\[\]]*?)\]\((?<link>[^\(\)]*?)\)/gu;
        for (let match of content.matchAll(linkPattern)) {
            let { text, link } = match.groups;
            if (link.match(/https?:\/\//u) === null) {
                let asset = app.vault.getAbstractFileByPath(link);
                let cloudPath = this.settings.assetsFolder + asset.name;
                link = cloudPath;
            }
            content.replace(match[0], `[${text ?? ""}](${link})`);
        }
        return content;
    }

    async replacecontentView(content: string, filePath: string): Promise<string> {
        let dv = getAPI();
        if (dv === undefined) return content;
        let contentviewPattern = /(?<separator>`*)dataview\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (let match of content.matchAll(contentviewPattern)) {
            let { separator, content } = match.groups;
            let res = await dv.queryMarkdown(content);
            if (res.successful) {
                content = content.replace(match[0], res.value);
            }
            else {
                content = content.replace(match[0], (res as Failure<string, string>).error);
            }
        }
        let contentviewJSPattern = /(?<separator>`*)dataviewjs\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (let match of content.matchAll(contentviewJSPattern)) {
            let { separator, content } = match.groups;
            let res = await dv.queryMarkdown(content);
            if (res.successful) {
                content = content.replace(match[0], res.value);
            }
            else {
                content = content.replace(match[0], (res as Failure<string, string>).error);
            }
        }
        return content;
    }

    replaceAdmonition(content: string): string {
        let admonitionToVuepress = new Map<string, string>();
        admonitionToVuepress.set("tip", "tip");
        admonitionToVuepress.set("hint", "tip");
        admonitionToVuepress.set("important", "tip");
        admonitionToVuepress.set("info", "info");
        admonitionToVuepress.set("todo", "info");
        admonitionToVuepress.set("warning", "warning");
        admonitionToVuepress.set("caution", "warning");
        admonitionToVuepress.set("attention", "warning");
        admonitionToVuepress.set("danger", "danger");
        admonitionToVuepress.set("error", "danger");
        admonitionToVuepress.set("note", "note");
        let admonitionPattern = /(?<separator>`*)ad-(?<type>[\S]+)\n(?:title: (?<title>.+))?\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (let match of content.matchAll(admonitionPattern)) {
            let { separator, type, title, content } = match.groups;
            let containerType = admonitionToVuepress.get(type);
            if (type !== undefined) {
                content = content.replace(match[0], `::: ${containerType} ${title ?? ""}
${content}
:::`);
            }
        }
        return content;
    }

    replaceChart(content: string): string {
        let chartPattern = /(?<separator>`*)chart\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (let match of content.matchAll(chartPattern)) {
            let { separator, content } = match.groups;
            content = content.replace(match[0], `::: chart

\`\`\`json
${JSON.stringify(parseYaml(content), null, 4)}
\`\`\`

:::
`)
        }
        return content;
    }

    replaceEChart(content: string): string {
        return content;
    }

}