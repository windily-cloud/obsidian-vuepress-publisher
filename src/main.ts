import { Plugin } from 'obsidian'
import { VuepressPublisherSettingTab } from './settings';
import { CloudHandler, getGithubRepoInfo } from './service/api';
import t from './i18n'
import { Formatter } from './formatFile';
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
  assetsFolder?: string
}

const DEFAULT_SETTINGS: Partial<VuepressPublisherSettings> = {
  publishFolder: "",
  publishKey: "publish",
  githubRepo: "",
  githubSSHKey: "",
  githubVuepressConfigFile: "",
  giteeVuepressConfigFile: "",
  assetsFolder: "docs/images"
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
    this.formatter = new Formatter(this);

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
        console.log(await this.formatter.replaceChart(`\`\`\`chart
type: bar
labels: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, "next Week", "next Month"]
series:
  - title: Title 1
    data: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  - title: Title 2
    data: [5, 4, 3, 2, 1, 0, -1, -2, -3]
\`\`\``));
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
