import { Plugin } from 'obsidian'
import { VuepressPublisherSettingTab } from './settings';
import { CloudHandler, getGithubRepoInfo } from './service/api';
import t from './i18n'
import Formatter from './processor/formatter'


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
}

const DEFAULT_SETTINGS: Partial<VuepressPublisherSettings> = {
  publishFolder: "",
  publishKey: "publish",
  githubRepo: "",
  githubSSHKey: "",
  githubVuepressConfigFile: "",
  giteeVuepressConfigFile: ""
};

export default class VuepressPublisher extends Plugin {
  settings: VuepressPublisherSettings;
  cloudHandler: CloudHandler;
  formatter: Formatter;

  async onload(): Promise<void> {
    console.log('loading Vuepress Publisher...')
    await this.loadSettings()
    this.addSettingTab(new VuepressPublisherSettingTab(this));

    this.cloudHandler = new CloudHandler(this);
    this.formatter = new Formatter(this.settings);

    this.addCommand({
      id: "vuepress-publisher-publish",
      name: t("githubPublish") as string,
      callback: () => {
        getGithubRepoInfo(this).then(
          (res) => {
            console.log(res)
          }
        )
      }
    })

    this.addCommand({
      id: "vuepress-publisher-test",
      name: "Test",
      callback: async () => {
        const currentFile = app.workspace.getActiveFile()
        const result = this.formatter.replaceAdmonition(await app.vault.cachedRead(currentFile))
        console.log(result)
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
