import { Plugin } from 'obsidian'
import { VuepressPublisherSettingTab } from "./settings";

interface VuepressPublisherSettings {
  dateFormat: string;
}

const DEFAULT_SETTINGS: Partial<VuepressPublisherSettings> = {
  dateFormat: "YYYY-MM-DD",
};

export default class VuepressPublisher extends Plugin {
  settings: VuepressPublisherSettings;

  async onload(): Promise<void> {
    console.log('loading Vuepress Publisher...')

    //Setting
    this.addSettingTab(new VuepressPublisherSettingTab(this.app, this));

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