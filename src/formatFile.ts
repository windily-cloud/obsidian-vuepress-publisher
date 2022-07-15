import { parseYaml, stringifyYaml, TFile } from "obsidian";
import VuepressPublisher from './main';
import { relative, dirname, basename, join } from "path";
import { CloudHandler } from 'service/api';
import { Failure, getAPI, Success } from "obsidian-dataview";

export class Formatter {
    plugin: VuepressPublisher;
    cloudHandler: CloudHandler

    constructor(plugin: VuepressPublisher) {
        this.plugin = plugin;
        this.cloudHandler = this.plugin.cloudHandler;
    }
    async formatFile(file: TFile): Promise<string> {
        let data = await app.vault.read(file);
        data = await this.replaceDataView(data, file.path);
        data = this.replaceAdmonition(data);
        data = this.replaceChart(data);
        data = this.replaceEChart(data);
        data = this.replaceWikiLinks(data, file.path);
        data = await this.replaceAssetsLinks(data, file.path);
        return data;
    }

    replaceWikiLinks(data: string, filePath: string): string {
        let wikiLinkPattern = /\[\[(?<path>[^|]*?)(?:\|(?<text>[^|]*?))?\]\]/gu;

        for (let match of data.matchAll(wikiLinkPattern)) {
            let { path, text } = match.groups;
            let linkPattern = /(?<link>(?:[^#]*))(?<title>#[^#]*)?/u;
            let { link, title } = path.match(linkPattern).groups;
            let toFile = app.metadataCache.getFirstLinkpathDest(link, filePath);
            let toFilePath = join(relative(filePath, dirname(toFile.path)), basename(filePath, ".md"));
            data = data.replace(match[0], `[${text ? text : path}](${toFilePath + (title ?? "")})`);
        }
        return data;
    }

    async replaceAssetsLinks(data: string, filePath: string): Promise<string> {
        let linkPattern = /\[(?<text>[^\[\]]*?)\]\((?<link>[^\(\)]*?)\)/gu;
        for (let match of data.matchAll(linkPattern)) {
            let { text, link } = match.groups;
            if (link.match(/https?:\/\//u) === null) {
                let asset = app.vault.getAbstractFileByPath(link);
                if (!(asset instanceof TFile)) { continue; }
                if (asset.stat.size > 1024 * 1024 * 10) { continue; }
                let cloudPath = this.plugin.settings.assetsFolder + asset.name;
                await this.cloudHandler.updateFile(asset, cloudPath);
                link = cloudPath;
            }
            data.replace(match[0], `[${text ?? ""}](${link})`);
        }
        return data;
    }

    async replaceDataView(data: string, filePath: string): Promise<string> {
        let dv = getAPI();
        if (dv === undefined) return data;
        let dataviewPattern = /(?<separator>`*)dataview\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (let match of data.matchAll(dataviewPattern)) {
            let { separator, content } = match.groups;
            let res = await dv.queryMarkdown(content);
            if (res.successful) {
                data = data.replace(match[0], res.value);
            }
            else {
                data = data.replace(match[0], (res as Failure<string, string>).error);
            }
        }
        let dataviewJSPattern = /(?<separator>`*)dataviewjs\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (let match of data.matchAll(dataviewJSPattern)) {
            let { separator, content } = match.groups;
            let res = await dv.queryMarkdown(content);
            if (res.successful) {
                data = data.replace(match[0], res.value);
            }
            else {
                data = data.replace(match[0], (res as Failure<string, string>).error);
            }
        }
        return data;
    }

    replaceAdmonition(data: string): string {
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
        for (let match of data.matchAll(admonitionPattern)) {
            let { separator, type, title, content } = match.groups;
            let containerType = admonitionToVuepress.get(type);
            if (type !== undefined) {
                data = data.replace(match[0], `::: ${containerType} ${title ?? ""}
${content}
:::`);
            }
        }
        return data;
    }

    replaceChart(data: string): string {
        let chartPattern = /(?<separator>`*)chart\n(?<content>[\s\S]*)\n?\k<separator>/gu;
        for (let match of data.matchAll(chartPattern)) {
            let { separator, content } = match.groups;
            data = data.replace(match[0], `::: chart

\`\`\`json
${JSON.stringify(parseYaml(content), null, 4)}
\`\`\`

:::
`)
        }
        return data;
    }

    replaceEChart(data: string): string {
        return data;
    }

}