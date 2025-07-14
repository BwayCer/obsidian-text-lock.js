import { Editor, MarkdownView, Notice, Plugin } from "npm:obsidian";
import { config, KeyInfo, langText, setNewConfig } from "./data.ts";
import { cryptoCan } from "./cryptoCan.ts";
import { TextLockSettingTab } from "./TextLockSettingTab.ts";
import { UnlockModal, UnlockModalMode } from "./modals/UnlockModal.ts";
import { DisplayModal } from "./modals/DisplayModal.ts";

interface ParseCodeBlockResult {
  publicContent: string;
  keyName: string;
  ciphertext: string;
}

export default class TextLock extends Plugin {
  override async onload() {
    await this.loadSettings();

    // NOTE: 設定面板
    this.addSettingTab(new TextLockSettingTab(this.app, this));

    // NOTE: 增加命令操作
    this.addCommand({
      id: "encrypt-selection",
      name: langText("command__encrypt_selection__name"),
      editorCallback: async (editor: Editor) => {
        this.selectEntireBlock(editor);
        const selection = editor.getSelection();

        const keyNames = this.getKeyNames();
        const modal = new UnlockModal(
          this.app,
          UnlockModalMode.Lock,
          this.checkPassword.bind(this),
          keyNames,
          keyNames[0],
          "",
          selection,
        );
        const result = await modal.openAndAwaitResult();
        if (!result.isSubmitted) {
          return;
        }

        const replacement = await this.getReplacement(
          false,
          result.password,
          result.keyName,
          langText("app__replace_public_hint") + "\n" + result.plaintext,
          result.plaintext,
        );
        if (replacement) {
          editor.replaceSelection(replacement);
          new Notice(langText("app__lock_notice"));
          return;
        }

        new Notice(langText("app__lock_error_notice"));
      },
    });

    // NOTE: 註冊代碼塊渲染器
    this.addTextlockCodeBlockProcessor();
  }

  // override async onunload() { await this.saveSettings();
  // }

  async loadSettings() {
    const cacheConfig = await this.loadData();
    const isOk = setNewConfig(cacheConfig);
    if (!isOk) {
      new Notice(langText("base__parse_data_content_error"));
    }
  }

  async saveSettings() {
    // 儲存到 plugin/data.json
    await this.saveData(config);
  }

  private getKeyNames() {
    return config.keys.map((item) => item.name);
  }

  private getKeyInfo(keyName: string): KeyInfo | null {
    return config.keys.find((item) => item.name === keyName) ?? null;
  }

  private selectEntireBlock(editor: Editor) {
    const from = editor.getCursor("from");
    const fromPosition = { line: from.line, ch: 0 };
    const to = editor.getCursor("to");
    const toPosition = {
      line: to.line,
      ch: editor.getLine(to.line).length,
    };

    editor.setSelection(fromPosition, toPosition);
    // 如此則
    // editor.getSelection();
    // editor.replaceSelection(replacement);
    // 可以替代
    // editor.getRange(fromPosition, toPosition);
    // editor.replaceRange(replacement, fromPosition, toPosition);
  }

  private async checkPassword(password: string, keyName: string): Promise<boolean> {
    const keyInfo = this.getKeyInfo(keyName);
    if (keyInfo) {
      const { cryptoScheme, key } = keyInfo;
      return await cryptoCan[cryptoScheme].isCorrect(password, key);
    }
    return false;
  }

  private async getReplacement(
    isInnerEditing: boolean,
    password: string,
    keyName: string,
    publicContent: string,
    plaintext: string,
  ): Promise<string | null> {
    const keyInfo = this.getKeyInfo(keyName);
    if (keyInfo) {
      const { cryptoScheme, key } = keyInfo;
      const encryptResult = await cryptoCan[cryptoScheme].encrypt(
        password,
        key,
        plaintext,
      );
      if (encryptResult.ok) {
        let replacement = "-- Public --\n" +
          `${publicContent}\n` +
          "-- Key --\n" +
          `${keyName}\n` +
          "-- Ciphertext --\n" +
          `${encryptResult.text}`;
        if (!isInnerEditing) {
          replacement = "```textlock\n" + replacement + "\n```";
        }

        return replacement;
      }
    }

    return null;
  }

  private parseCodeBlock(source: string): ParseCodeBlockResult {
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

    rtnData.publicContent = rtnData.publicContent.trim();
    rtnData.keyName = rtnData.keyName.trim();
    rtnData.ciphertext = rtnData.ciphertext.trim();

    return rtnData;
  }

  private addTextlockCodeBlockProcessor() {
    this.registerMarkdownCodeBlockProcessor("textlock", (source, el, ctx) => {
      let {
        publicContent,
        keyName,
        ciphertext,
      } = this.parseCodeBlock(source);

      const isCodeBlockFormatError = keyName === "" || ciphertext === "";
      if (isCodeBlockFormatError) {
        publicContent = langText("app__code_block_format_error_notice");
      }

      const container = el.createEl("div");
      container.classList.add("textlock-block");

      const publicDisplay = container.createEl("div");
      publicDisplay.classList.add("textlock-public");
      publicDisplay.textContent = publicContent;

      container.onclick = async () => {
        if (isCodeBlockFormatError) {
          new Notice(langText("app__code_block_format_error_notice"));
          return;
        }

        const keyNames = this.getKeyNames();
        const modal = new UnlockModal(
          this.app,
          UnlockModalMode.Unlock,
          this.checkPassword.bind(this),
          keyNames,
          keyName,
        );
        const unlockModalResult = await modal.openAndAwaitResult();

        if (!unlockModalResult.isSubmitted) {
          return;
        }

        let plaintext!: string;
        const keyInfo = this.getKeyInfo(unlockModalResult.keyName);
        if (keyInfo) {
          const { cryptoScheme, key } = keyInfo;
          const encryptResult = await cryptoCan[cryptoScheme].decrypt(
            unlockModalResult.password,
            key,
            ciphertext,
          );
          if (encryptResult.ok) {
            plaintext = encryptResult.text;
          } else {
            new Notice(langText("app__unlock_error_notice"));
            return;
          }
        }

        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        switch (view && view.getMode()) {
          // case null: // 沒開啟文章吧?!
          case "preview":
            new DisplayModal(this.app, this, plaintext).open();
            break;
          case "source": {
            const editor = view!.editor;
            const sectionInfo = ctx.getSectionInfo(el);
            if (!sectionInfo) {
              new Notice(langText("app__replace_action_error_notice"));
              return;
            }

            const fromPosition = { line: sectionInfo.lineStart + 1, ch: 0 };
            const toPosition = {
              line: sectionInfo.lineEnd - 1,
              ch: editor.getLine(sectionInfo.lineEnd - 1).length,
            };

            // Editing view: show a notice (or open edit modal in the future)
            const modal = new UnlockModal(
              this.app,
              UnlockModalMode.Lock,
              this.checkPassword.bind(this),
              keyNames,
              unlockModalResult.keyName,
              unlockModalResult.password,
              plaintext,
            );
            const result = await modal.openAndAwaitResult();
            if (!result.isSubmitted) {
              return;
            }

            const replacement = await this.getReplacement(
              true,
              result.password,
              result.keyName,
              publicContent,
              result.plaintext,
            );
            if (replacement) {
              editor.replaceRange(replacement, fromPosition, toPosition);

              new Notice(langText("app__lock_notice"));
              return;
            }

            new Notice(langText("app__lock_error_notice"));
            break;
          }
          default:
            break;
        }
      };
    });
  }
}
