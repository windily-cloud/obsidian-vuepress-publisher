import { TFile } from 'obsidian';
import { VuepressPublisherSettings } from './../main';

export default class Scanner {
  constructor(public settings: VuepressPublisherSettings) {
  }

  async getFilesMarkedForPublishing(): Promise<TFile[]> {
    const files = app.vault.getMarkdownFiles();
    const filesToPublish = [];
    for (const file of files) {
      try {
        const frontMatter = app.metadataCache.getCache(file.path).frontmatter
        if (frontMatter && frontMatter["publish"] === true) {
          filesToPublish.push(file);
        }
      } catch {
        //ignore
      }
    }
    
    return filesToPublish;
  }
}