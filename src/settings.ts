import VuepressPublisher from "./main";
import { PluginSettingTab} from "obsidian";
import { createApp } from "vue";
import type { App as VueApp } from "vue";
import SettingModal from './ui/SettingModal/Index.vue'
export class VuepressPublisherSettingTab extends PluginSettingTab {
  settingApp: VueApp
  constructor(public plugin: VuepressPublisher) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.settingApp = createApp(SettingModal)
    this.settingApp.config.globalProperties.plugin = this.plugin
    this.settingApp.mount(this.containerEl)
  }

  hide():void {
      this.settingApp.unmount()
  }
}
