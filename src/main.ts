import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface MyPluginSettings {
  keyGroup: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  keyGroup: JSON.stringify(
    {
      "key_group": [],
    },
    null,
    2,
  ),
};

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Data setting")
      .setDesc("like key groups")
      .addTextArea((text) => {
        text.inputEl.style.height = "150px";
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder(
            "Enter your data like:\n" +
              `"{ "key_group": [ { "name": "<金鑰名稱>", "key": "aD1Dfa6..." } ] }"`,
          )
          .setValue(this.plugin.settings.keyGroup)
          .onChange(async (value) => {
            this.plugin.settings.keyGroup = value;
            await this.plugin.saveSettings();
          });
      });
  }
}

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    // NOTE: 設定面板
    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
