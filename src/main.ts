import { Plugin, TFile } from 'obsidian'
import { VuepressPublisherSettingTab } from './settings';
import t from './i18n'
import Formatter from './processor/formatter'
import Publisher from './processor/publisher';
import Scanner from './processor/scanner';


export interface VuepressPublisherSettings {
  publishFolder?: string
  publishKey?: string

  githubRepo?: string
  githubSSHKey?: string
  githubVuepressConfigFile?: string

  giteeRepo?: string
  giteeSSHKey?: string
  giteeVuepressConfigFile?: string

  excludeFolder?: string
  excludeFile?: string

  publishedFiles?: Array<{
    filePath: string
    stat: {
      ctime: number
      mtime: number
      size: number
    }
    status: "Add" | "Update" | "Delete" | "Published"
  }>
}

const DEFAULT_SETTINGS: Partial<VuepressPublisherSettings> = {
  publishFolder: "",
  publishKey: "publish",
  githubRepo: "",
  githubSSHKey: "",
  githubVuepressConfigFile: "",
  giteeVuepressConfigFile: "",
  publishedFiles: []
};

export default class VuepressPublisher extends Plugin {
  settings: VuepressPublisherSettings;
  formatter: Formatter;

  async onload(): Promise<void> {
    console.log('loading Vuepress Publisher...')
    await this.loadSettings()
    this.addSettingTab(new VuepressPublisherSettingTab(this));

    this.formatter = new Formatter(this.settings);

    this.addCommand({
      id: "vuepress-publisher-test",
      name: "Test",
      callback: async () => {
        // const currentFile = app.workspace.getActiveFile()
        // const result = this.formatter.replaceAdmonition(await app.vault.cachedRead(currentFile))
        // console.log(result)
        // const publisher = new Publisher(this.settings, "github")
        // publisher.createGithubFile("This is a test file", "test.md")
        const scanner = new Scanner(this.settings)
        const markedFiles = scanner.getMarkedFiles()
        const filesToPublish = scanner.getFileToPublish()
        this.settings.publishedFiles = filesToPublish
        this.saveSettings()
        console.log("markedFiles", markedFiles, "filesToPublish", filesToPublish)
      }
    })
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
