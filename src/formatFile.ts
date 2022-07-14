import { TFile } from "obsidian";

export async function formatFile(file: TFile): Promise<string> {
    let data = await app.vault.read(file);
    data = replaceWikiLinks(data, file.path);
    data = replaceAssetsLinks(data, file.path);
    data = replaceDataView(data, file.path);
    data = replaceAdmonition(data);
    data = replaceChart(data);
    data = replaceEChart(data);
    return data;
}

function replaceWikiLinks(data: string, filePath: string): string {
    let wikiLinkPattern = /\[\[(?<path>[^|]*?)(?:\|(?<text>[^|]*?))?\]\]/u;

    for (let match of data.matchAll(wikiLinkPattern)) {
        let { path, text } = match.groups;
        let linkPattern = /(?<link>(?:[^#]*))(?:#(?<title>[^#]*))?/u;
        let { link, title } = path.match(linkPattern).groups;
        let toFile = app.metadataCache.getFirstLinkpathDest(link, filePath);
        data.replace(match[0], `[${text ? text : path}](${toFile.path + title !== undefined ? title : ""})`);
    }
    return data;
}

function replaceAssetsLinks(data: string, filePath: string): string {
    return data;
}

function replaceDataView(data: string, filePath: string): string {
    return data;
}

function replaceAdmonition(data: string): string {
    return data;
}

function replaceChart(data: string): string {
    return data;
}

function replaceEChart(data: string): string {
    return data;
}