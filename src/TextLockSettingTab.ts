import { App, Notice, PluginSettingTab, Setting } from "npm:obsidian";
import {
  config,
  LangReadableCode,
  langText,
  setLang,
  setNewConfig,
} from "./data.ts";
import type TextLock from "./main.ts";
import { ImportModal } from "./ImportModal.ts";

export class TextLockSettingTab extends PluginSettingTab {
  plugin: TextLock;

  constructor(app: App, plugin: TextLock) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", {
      text: langText("setting_tab__config__title"),
    });

    new Setting(containerEl)
      .addButton((button) =>
        button
          .setButtonText(langText("setting_tab__config__import_btn_text"))
          .onClick(async () => await this.importAction())
      )
      .addButton((button) =>
        button
          .setButtonText(langText("setting_tab__config__export_btn_text"))
          .onClick(() => {
            const configTxt = JSON.stringify(config, null, 2);
            navigator.clipboard.writeText(configTxt);
            new Notice(langText("general__copied_to_clipboard"));
          })
      );

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
  }

  async importAction() {
    const configTxt = JSON.stringify(config, null, 2);
    const modal = new ImportModal(this.app, configTxt);

    let result;
    try {
      result = await modal.openAndAwaitResult();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      new Notice(msg);
      return;
    }

    if (!result.isSubmitted || !result.isChanged) {
      return;
    }

    let newConfig: any;
    try {
      newConfig = JSON.parse(result.data);
    } catch (err) {
      console.error(err);
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
      return;
    }

    this.display();
  }
}
