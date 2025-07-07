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
import { DisplayModal } from "./DisplayModal.ts";
import { KeyValueDisplayModal } from "./KeyValueDisplayModal.ts";

interface TextLockSettings {
  data: string;
}

interface TextLockDataKeys {
  name: string;
  key: string;
}

interface TextLockData {
  keys: TextLockDataKeys[];
}

interface ParseCodeBlockResult {
  publicContent: string;
  keyName: string;
  ciphertext: string;
}

interface KeyValueItem {
  key: string;
  value: string;
}

const DEFAULT_SETTINGS: TextLockSettings = {
  data: JSON.stringify(
    {
      keys: [],
    },
    null,
    2,
  ),
};

class SampleSettingTab extends PluginSettingTab {
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

export default class TextLock extends Plugin {
  settings!: TextLockSettings;

  override async onload() {
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
        const keyNames = this.getKeyNames();

        const selection = editor.getSelection();
        const modal = new EditModal(this.app, keyNames, selection);
        try {
          const result = await modal.openAndAwaitResult();
          new Notice(
            `Selected Key: ${result.selectedKeyName}, Plaintext: ${result.plaintext}`,
          );

          // TODO: Implement encryption and replacement logic here
          const replacement = "```textlock\n" +
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
    this.registerMarkdownCodeBlockProcessor("textlock", (source, el, _ctx) => {
      const {
        publicContent,
        // keyName,
        ciphertext,
      } = this.parseCodeBlock(source);

      const container = el.createEl("div");
      container.classList.add("textlock-block");

      const publicDisplay = container.createEl("div");
      publicDisplay.classList.add("textlock-public");
      publicDisplay.textContent = publicContent.trim();

      container.onclick = async () => {
        const keyNames = this.getKeyNames();

        // TODO: open unlock modal
        const modal = new UnlockModal(this.app, keyNames);
        try {
          const result = await modal.openAndAwaitResult();
          new Notice(
            `Selected Key: ${result.selectedKeyName}, Password: ${result.password}`,
          );
        } catch (error) {
          new Notice(`Modal dismissed: ${error}`);
        }

        // TODO:
        const plaintext = ciphertext;

        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view && view.getMode() === "preview") {
          // Reading view
          const keyValuePairs = this.parseKeyValueContent(plaintext);
          if (keyValuePairs) {
            new KeyValueDisplayModal(this.app, keyValuePairs).open();
          } else {
            new DisplayModal(this.app, this, plaintext).open();
          }
        } else {
          // Editing view: show a notice (or open edit modal in the future)
          const modal = new EditModal(
            this.app,
            keyNames,
            plaintext,
          );
          try {
            const result = await modal.openAndAwaitResult();
            new Notice(
              `Selected Key: ${result.selectedKeyName}, Password: ${result.plaintext}`,
            );
            // TODO: Implement decryption logic here using the selected key and password
          } catch (error) {
            new Notice(`Modal dismissed: ${error}`);
          }
        }
      };
    });
  }

  // onunload() {}

  getKeyNames() {
    let keyNames: string[] = [];
    try {
      const data: TextLockData = JSON.parse(this.settings.data);
      if (data.keys && Array.isArray(data.keys)) {
        keyNames = data.keys.map((item) => item.name);
      }
    } catch (err) {
      new Notice("Error parsing Key data. Check settings.");
      console.error(err);
    }
    return keyNames;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  parseCodeBlock(source: string): ParseCodeBlockResult {
    const rtnData = {
      publicContent: "",
      keyName: "",
      ciphertext: "",
    };
    let optionName = "";

    const lines = source.split("\n");
    for (const line of lines) {
      switch (line.trim()) {
        case "-- Public --":
          optionName = "publicContent";
          break;
        case "-- Key --":
          optionName = "keyName";
          break;
        case "-- Ciphertext --":
          optionName = "ciphertext";
          break;
        default:
          if (optionName != "") {
            rtnData[optionName as keyof typeof rtnData] += line + "\n";
          }
      }
    }

    return rtnData;
  }

  parseKeyValueContent(content: string): KeyValueItem[] | null {
    const lines = content.trim().split("\n");
    const keyValuePairs: KeyValueItem[] = [];
    for (const line of lines) {
      if (line.includes(":")) {
        const index = line.indexOf(":");
        const key = line.slice(0, index);
        const value = line.slice(index + 1).trim();
        keyValuePairs.push({ key, value });
      } else {
        return null; // Not a key:value format
      }
    }
    return keyValuePairs;
  }
}
