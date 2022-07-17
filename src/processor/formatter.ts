import { VuepressPublisherSettings } from './../main';
import { Failure, DataviewApi } from "obsidian-dataview";
import path from "path";

export default class Formatter {
  constructor(public settings: VuepressPublisherSettings){}

  replaceWikiLinks(content: string, getFirstLinkpathDest: (linkpath: string, sourcePath: string) => string | null): string {
    const wikiLinkPattern = /\[\[(?<filePath>[^|]*?)(?:\|(?<text>[^|]*?))?\]\]/gu;
    for (const match of content.matchAll(wikiLinkPattern)) {
      const { filePath, text } = match.groups;
      const linkPattern = /(?<link>(?:[^#]*))(?<title>#[^#]*)?/u;
      const { link, title } = filePath.match(linkPattern).groups;
      const toFile = getFirstLinkpathDest(link, filePath)
      const toFilePath = path.relative(toFile, this.settings.publishFolder)
      content = content.replace(match[0], `[${text ? text : path}](${toFilePath + (title ?? "")})`);
    }
    return content
  }

  replaceAssetsLinks(content: string): string {
    const linkPattern = /\[(?<text>[^[\]]*?)\]\((?<link>[^()]*?)\)/gu;
    for (const match of content.matchAll(linkPattern)) {
      const { text } = match.groups;
      let { link } = match.groups;
      if (link.match(/https?:\/\//u) === null) {
        const asset = app.vault.getAbstractFileByPath(link);
        const cloudPath = "/" + asset.name;
        link = cloudPath;
      }
      content.replace(match[0], `[${text ?? ""}](${link})`);
    }
    return content;
  }

  replaceAdmonition(content: string): string {
    const admonitionToVuepress = new Map<string, string>();
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
    const admonitionPattern = /(?<separator>`*)ad-(?<type>[\S]+)\n(?:title: (?<title>.+))?\n(?<content>[\s\S]*)\n?\k<separator>/gu;
    for (const match of content.matchAll(admonitionPattern)) {
      let { content } = match.groups;
      const { type, title } = match.groups
      const containerType = admonitionToVuepress.get(type);
      if (type !== undefined) {
        content = content.replace(match[0], `::: ${containerType} ${title ?? ""}
${content}
:::`);
      }
    }
    return content;
  }

  async replaceContentView(content: string, dv: DataviewApi): Promise<string> {
    if (dv === undefined) return content;
    const contentviewPattern = /(?<separator>`*)dataview\n(?<content>[\s\S]*)\n?\k<separator>/gu;
    for (const match of content.matchAll(contentviewPattern)) {
      let { content } = match.groups;
      const res = await dv.queryMarkdown(content);
      if (res.successful) {
        content = content.replace(match[0], res.value);
      }
      else {
        content = content.replace(match[0], (res as Failure<string, string>).error);
      }
    }
    const contentviewJSPattern = /(?<separator>`*)dataviewjs\n(?<content>[\s\S]*)\n?\k<separator>/gu;
    for (const match of content.matchAll(contentviewJSPattern)) {
      let { content } = match.groups;
      const res = await dv.queryMarkdown(content);
      if (res.successful) {
        content = content.replace(match[0], res.value);
      }
      else {
        content = content.replace(match[0], (res as Failure<string, string>).error);
      }
    }
    return content;
  }

  replaceChart(content: string, parseYaml: (yaml: string) => string): string {
    const chartPattern = /(?<separator>`*)chart\n(?<content>[\s\S]*)\n?\k<separator>/gu;
    for (const match of content.matchAll(chartPattern)) {
      let { content } = match.groups;
      content = content.replace(match[0], `::: chart

\`\`\`json
${JSON.stringify(parseYaml(content), null, 4)}
\`\`\`

:::
`)
    }
    return content;
  }
}