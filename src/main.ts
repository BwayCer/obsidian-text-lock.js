import {
  App,
  Editor,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from "npm:obsidian";
import { UnlockModal } from "./UnlockModal.ts";
import { EditModal } from "./EditModal.ts";

interface NoteLockSettings {
  data: string;
}

const DEFAULT_SETTINGS: NoteLockSettings = {
  data: JSON.stringify(
    {
      "keys": [],
    },
    null,
    2,
  ),
};

class SampleSettingTab extends PluginSettingTab {
  plugin: NoteLock;

  constructor(app: App, plugin: NoteLock) {
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
        text.inputEl.style.height = "150px";
        text.inputEl.style.width = "100%";
        text
          .setPlaceholder(
            "Enter your data like:\n" +
              `"{ "keys": [ { "name": "<金鑰名稱>", "key": "aD1Dfa6..." } ] }"`,
          )
          .setValue(this.plugin.settings.data)
          .onChange(async (value) => {
            this.plugin.settings.data = value;
            await this.plugin.saveSettings();
          });
      });
  }
}

export default class NoteLock extends Plugin {
  settings: NoteLockSettings;

  async onload() {
    await this.loadSettings();

    // NOTE: 設定面板
    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    // NOTE: 增加命令操作
    // This adds an editor command that can perform some operation on the current editor instance
    this.addCommand({
      id: "encrypt-selection",
      name: "Encrypt selection",
      editorCallback: async (editor: Editor) => {
        let keyNames: string[] = [];
        try {
          const keyData = JSON.parse(this.settings.key);
          if (keyData.key && Array.isArray(keyData.key)) {
            keyNames = keyData.key.map((k: any) => k.name);
          }
        } catch (e) {
          new Notice("Error parsing Key data. Check settings.");
          console.error(e);
          return;
        }

        const selection = editor.getSelection();
        const modal = new EditModal(this.app, keyNames, selection);
        try {
          const result = await modal.openAndAwaitResult();
          new Notice(
            `Selected Key: ${result.selectedKeyName}, Plaintext: ${result.plaintext}`,
          );

          // TODO: Implement encryption and replacement logic here
          const replacement = "```notelock\n" +
            "-- Public --\n" +
            "公開內容...\n" +
            "-- Key --\n" +
            "銀行相關\n" +
            "-- Ciphertext --\n" +
            `${result.plaintext}\n` +
            "```";
          editor.replaceSelection(replacement);
        } catch (error) {
          new Notice(`Modal dismissed: ${error}`);
        }
      },
    });

    // NOTE: 註冊代碼塊渲染器
    this.registerMarkdownCodeBlockProcessor("notelock", (source, el, ctx) => {
      const lines = source.split("\n");
      let publicContent = "";
      let inPublicSection = false;

      for (const line of lines) {
        if (line.trim() === "-- Public --") {
          inPublicSection = true;
          continue;
        }
        if (line.trim().startsWith("-- Key --")) {
          inPublicSection = false;
          break;
        }
        if (inPublicSection) {
          publicContent += line + "\n";
        }
      }

      const container = el.createEl("div");
      container.classList.add("notelock-block");

      const publicDisplay = container.createEl("div");
      publicDisplay.classList.add("notelock-public");
      publicDisplay.textContent = publicContent.trim();

      container.onclick = async () => {
        const keyNames = this.getKeyNames();

        // TODO: open unlock modal

        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view && view.getMode() === "preview") {
          // Reading view
          const modal = new UnlockModal(this.app, keyNames);
          try {
            const result = await modal.openAndAwaitResult();
            new Notice(
              `Selected Key: ${result.selectedKeyName}, Password: ${result.password}`,
            );
            // TODO: Implement decryption logic here using the selected key and password
          } catch (error) {
            new Notice(`Modal dismissed: ${error}`);
          }
        } else {
          // Editing view: show a notice (or open edit modal in the future)

          // TODO: Editing in Live Preview is not yet supported from the reading view.
          const modal = new EditModal(this.app, keyNames, "TODO decrypt plaintext");
          try {
            const result = await modal.openAndAwaitResult();
            new Notice(
              `Selected Key: ${result.selectedKeyName}, Password: ${result.password}`,
            );
            // TODO: Implement decryption logic here using the selected key and password
          } catch (error) {
            new Notice(`Modal dismissed: ${error}`);
          }
        }
      };
    });
  }

  onunload() {
  }

  getKeyNames() {
    let keyNames: string[] = [];
    try {
      const data = JSON.parse(this.settings.data);
      if (data.keys && Array.isArray(data.keys)) {
        keyNames = data.keys.map((kg: any) => kg.name);
      }
    } catch (err) {
      new Notice("Error parsing Key data. Check settings.");
      console.error(err);
      return [];
    }
    return keyNames;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
