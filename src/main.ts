import { Plugin } from 'obsidian'
import { VuepressPublisherSettingTab } from './settings';
import { getGithubRepoInfo } from './service/api';
import t from './i18n'
interface VuepressPublisherSettings {
  publishFolder?: string
  publishKey?: string
  githubRepo?: string
  excludeFolder?: string
  excludeFile?: string
  githubVuepressConfigFile?: string
  giteeVuepressConfigFile?: string
  githubSSHKey?: string
  giteeRepo?: string
  giteeSSHKey?: string
}

const DEFAULT_SETTINGS: Partial<VuepressPublisherSettings> = {
  publishFolder: "",
  publishKey: "publish",
  githubRepo: "",
  githubSSHKey: "",
  githubVuepressConfigFile: "",
  giteeVuepressConfigFile: ""
}

export default class VuepressPublisher extends Plugin {
  settings: VuepressPublisherSettings;

  async onload(): Promise<void> {
    console.log('loading Vuepress Publisher...')
    await this.loadSettings()
    //Setting
    this.addSettingTab(new VuepressPublisherSettingTab(this));

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
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }


  async onunload(): Promise<void> {
  }
}