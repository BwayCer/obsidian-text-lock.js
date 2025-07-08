import { App, Notice, PluginSettingTab, Setting } from "npm:obsidian";
import {
  config,
  configPlaceholder,
  LangReadableCode,
  langText,
  setLang,
  setNewConfig,
} from "./data.ts";
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
      .setName(langText("setting_tab__lang__language"))
      .addDropdown((dropdown) => {
        Object.entries(LangReadableCode).forEach(([key, val]) => {
          dropdown.addOption(key, val);
        });
        dropdown.setValue(config.langCode);
        dropdown.onChange(async (value) => {
          const ok = setLang(value);
          if (ok) {
            await this.plugin.saveSettings();
            this.display();
          } else {
            new Notice(langText("setting_tab__lang__not_found_lang", {
              lang: value,
            }));
          }
        });
      });

    new Setting(containerEl)
      .setName(langText("setting_tab__config__title"))
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
                langText("setting_tab__config__parse_data_format_error"),
              );
              return;
            }

            const isOk = setNewConfig(newConfig);
            if (isOk) {
              await this.plugin.saveSettings();
            } else {
              new Notice(
                langText("setting_tab__config__parse_data_content_error"),
              );
            }
          });
      });
  }
}
