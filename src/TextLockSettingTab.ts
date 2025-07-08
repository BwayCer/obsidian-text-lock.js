import { App, Notice, PluginSettingTab, Setting } from "npm:obsidian";
import { config, configPlaceholder, setNewConfig } from "./data.ts";
import type TextLock from "./main.ts";

export class TextLockSettingTab extends PluginSettingTab {
  plugin: TextLock;

  constructor(app: App, plugin: TextLock) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Data setting")
      .setDesc("like keys")
      .addTextArea((text) => {
        const configTxt = JSON.stringify(config, null, 2);
        text.inputEl.style.height = "150px";
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder(configPlaceholder)
          .setValue(configTxt)
          .onChange(async (value) => {
            let newConfig: any;
            try {
              newConfig = JSON.parse(value);
            } catch (err) {
              new Notice(
                "Error parsing data from settings. Check the data format.",
              );
              console.error(err);
              return;
            }

            const isOk = setNewConfig(newConfig);
            if (isOk) {
              await this.plugin.saveSettings();
            } else {
              new Notice(
                "Error type data from settings. Check the data format.",
              );
            }
          });
      });
  }
}
