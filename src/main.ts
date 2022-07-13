import { VuepressPublisherSettingTab } from "./settings";
import { App, Plugin } from 'obsidian';
import { Octokit } from 'octokit';

interface VuepressPublisherSettings {
  token: string;
  assetsFolder: string;
}

const DEFAULT_SETTINGS: Partial<VuepressPublisherSettings> = {
  assetsFolder: "docs/assets",
};

export default class VuepressPublisher extends Plugin {
  app: App
  settings: VuepressPublisherSettings;
  octokit: Octokit;

  async onload(): Promise<void> {
    console.log('loading Vuepress Publisher...')

    //Setting
    this.addSettingTab(new VuepressPublisherSettingTab(this.app, this));

    this.octokit = new Octokit({ auth: this.settings.token });

    const {
      data: { login }
    } = await this.octokit.rest.users.getAuthenticated();
    console.log(login);
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