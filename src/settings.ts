import VuepressPublisher from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class VuepressPublisherSettingTab extends PluginSettingTab {
  constructor(app: App, public plugin: VuepressPublisher) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("GitHub Token")
      .setDesc("Your personal GitHub Token.")
      .addText((text) =>
        text
          .onChange(async (value) => {
            this.plugin.settings.token = value;
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