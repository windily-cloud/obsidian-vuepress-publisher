import VuepressPublisher from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { Octokit } from "octokit";

export class VuepressPublisherSettingTab extends PluginSettingTab {
  constructor(app: App, public plugin: VuepressPublisher) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("GitHub Username")
      .setDesc("Your GitHub Username.")
      .addText((text) =>
        text
          .onChange(async (value) => {
            this.plugin.settings.username = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("GitHub Repo")
      .setDesc("Your GitHub Repo for publishing.")
      .addText((text) =>
        text
          .onChange(async (value) => {
            this.plugin.settings.repo = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("GitHub Token")
      .setDesc("Your personal GitHub Token.")
      .addText((text) =>
        text
          .onChange(async (value) => {
            this.plugin.settings.token = value;
            this.plugin.octokit = new Octokit({ auth: value });
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Assets Folder")
      .setDesc("The folder to place all assets in your github repository.")
      .addText((text) =>
        text
          .setPlaceholder("docs/images")
          .onChange(async (value) => {
            this.plugin.settings.assetsFolder = value;
            await this.plugin.saveSettings();
          })
      );
  }
}