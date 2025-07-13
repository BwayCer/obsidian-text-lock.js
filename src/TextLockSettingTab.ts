import { App, Notice, PluginSettingTab, Setting } from "npm:obsidian";
import {
  config,
  KeyInfo,
  LangReadableCode,
  langText,
  setLang,
  setNewConfig,
} from "./data.ts";
import { cryptoCan } from "./cryptoCan.ts";
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
      const { name: keyName, cryptoScheme } = keyInfo;
      new Setting(containerEl)
        .setName(keyName)
        .setDesc(cryptoScheme)
        .addButton((button) =>
          button
            .setButtonText(langText("setting_tab__keys__rename_btn_text"))
            .onClick(async () => {
              const modal = new KeyModal(
                this.app,
                KeyModalMode.Rename,
                keyName,
              );
              const result = await modal.openAndAwaitResult();

              if (result.isSubmitted) {
                keyInfo.name = result.name;
                await this.plugin.saveSettings();
                new Notice(langText("setting_tab__keys__name_updated_notice"));
                this.display();
              }
            })
        )
        .addButton((button) =>
          button
            .setButtonText(langText("setting_tab__keys__update_btn_text"))
            .onClick(async () => await this.updateKeyAction(keyInfo))
        )
        .addButton((button) =>
          button
            .setButtonText(langText("setting_tab__keys__delete_btn_text"))
            .onClick(async () => {
              config.keys.splice(index, 1);
              await this.plugin.saveSettings();
              new Notice(
                langText("setting_tab__keys__password_deleted_notice"),
              );
              this.display();
            })
        );
    });

    new Setting(containerEl).addButton((button) =>
      button
        .setButtonText(langText("setting_tab__keys__create_btn_text"))
        .onClick(async () => await this.createKeyAction())
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

  async createKeyAction() {
    const modal = new KeyModal(
      this.app,
      KeyModalMode.Create,
    );
    const modalResult = await modal.openAndAwaitResult();

    if (!modalResult.isSubmitted) {
      return;
    }

    const createKeyResult = await cryptoCan[modalResult.cryptoScheme].createKey(
      modalResult.password,
    );
    if (!createKeyResult.ok) {
      new Notice(
        langText("setting_tab__keys__password_create_failed_notice"),
      );
    }

    config.keys.push({
      name: modalResult.name,
      cryptoScheme: modalResult.cryptoScheme,
      key: createKeyResult.text,
    });
    await this.plugin.saveSettings();
    new Notice(
      langText("setting_tab__keys__password_created_notice"),
    );
    this.display();
  }

  async updateKeyAction(keyInfo: KeyInfo) {
    const { name: keyName, cryptoScheme, key } = keyInfo;
    const cryptoKit = cryptoCan[cryptoScheme];

    const modal = new KeyModal(
      this.app,
      KeyModalMode.Update,
      keyName,
      (password: string): Promise<boolean> => {
        return cryptoKit.isCorrect(password, key);
      },
    );
    const modalResult = await modal.openAndAwaitResult();

    if (!modalResult.isSubmitted) {
      return;
    }

    const reencryptKeyResult = await cryptoKit.reencryptKey(
      modalResult.oldPassword,
      key,
      modalResult.password,
    );
    if (!reencryptKeyResult.ok) {
      new Notice(
        langText("setting_tab__keys__password_update_failed_notice"),
      );
    }

    keyInfo.key = reencryptKeyResult.text;
    await this.plugin.saveSettings();
    new Notice(
      langText("setting_tab__keys__password_updated_notice"),
    );
  }
}
