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
import { KeyModal, KeyModalMode } from "./KeyModal.ts";

export class TextLockSettingTab extends PluginSettingTab {
  plugin: TextLock;

  constructor(app: App, plugin: TextLock) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h1", {
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

    containerEl.createDiv("setting-item");

    containerEl.createEl("h2", {
      text: langText("setting_tab__keys__title"),
    });

    config.keys.forEach((keyInfo, index) => {
      const { name, cryptoScheme, key } = keyInfo;
      new Setting(containerEl)
        .setName(name)
        .addButton((button) =>
          button
            .setButtonText(langText("setting_tab__keys__rename_btn_text"))
            .onClick(async () => {
              const modal = new KeyModal(
                this.app,
                KeyModalMode.Rename,
                name,
              );
              const result = await modal.openAndAwaitResult();

              if (result.isSubmitted) {
                keyInfo.name = result.name;
              }
            })
        )
        .addButton((button) =>
          button
            .setButtonText(langText("setting_tab__keys__update_btn_text"))
            .onClick(async () => {
              const modal = new KeyModal(
                this.app,
                KeyModalMode.Update,
                name,
                (password: string): boolean => {
                  // TODO: 驗證密碼是否正確
                  return false;
                },
              );
              const result = await modal.openAndAwaitResult();
              console.log(result);

              // TODO: 生成新金鑰
            })
        )
        .addButton((button) =>
          button
            .setButtonText(langText("setting_tab__keys__delete_btn_text"))
            .onClick(async () => {
              config.keys.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            })
        );
    });

    new Setting(containerEl).addButton((button) =>
      button
        .setButtonText(langText("setting_tab__keys__create_btn_text"))
        .onClick(async () => {
          const modal = new KeyModal(
            this.app,
            KeyModalMode.Create,
          );
          const result = await modal.openAndAwaitResult();
          console.log(result);

          // TODO: 生成新金鑰
        })
    );
  }

  async importAction() {
    const configTxt = JSON.stringify(config, null, 2);
    const modal = new ImportModal(this.app, configTxt);
    const result = await modal.openAndAwaitResult();

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
