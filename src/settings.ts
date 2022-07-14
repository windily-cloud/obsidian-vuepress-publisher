import VuepressPublisher from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import t from './i18n'
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
      .setName(t("githubRepo") as string)
      .setDesc(t("githubRepoDesc") as string)
      .addText((text) =>
        text
          .setPlaceholder(t("githubRepoPlaceholder") as string)
          .setValue(this.plugin.settings && this.plugin.settings.github.repoName ? this.plugin.settings.github.repoName : '')
          .onChange(async (value) => {
            this.plugin.settings.github.repoName = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("githubToken") as string)
      .setDesc(t("githubTokenDesc") as string)
      .addText((text)=>{
        text.setValue(this.plugin.settings && this.plugin.settings.github.token? this.plugin.settings.github.token : '')
        .onChange(async (value)=>{
          this.plugin.settings.github.token = value;
          await this.plugin.saveSettings()
        })
      })

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
