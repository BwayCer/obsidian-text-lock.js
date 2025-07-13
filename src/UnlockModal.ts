import { App, Modal, Notice, Setting } from "npm:obsidian";
import { langText } from "./data.ts";

type CheckPassword = (password: string, keyName: string) => Promise<boolean>;

export enum UnlockModalMode {
  Unlock,
  Lock,
}

interface UnlockModalResult {
  isSubmitted: boolean;
  keyName: string;
  password: string;
  plaintext: string;
}

export class UnlockModal extends Modal {
  private mode: UnlockModalMode;
  private checkPassword: CheckPassword;
  private keyNames: string[];
  private result: UnlockModalResult;

  constructor(
    app: App,
    mode: UnlockModalMode,
    checkPassword: CheckPassword,
    keyNames: string[],
    selectedKeyName?: string,
    password?: string,
    plaintext?: string,
  ) {
    super(app);
    this.mode = mode;
    this.checkPassword = checkPassword;
    this.keyNames = keyNames;

    const isKeyofKeyNames = selectedKeyName
      ? keyNames.includes(selectedKeyName)
      : false;

    this.result = {
      isSubmitted: false,
      keyName: isKeyofKeyNames
        ? selectedKeyName!
        : keyNames.length > 0
        ? keyNames[0]
        : "",
      password: password ?? "",
      plaintext: plaintext ?? "",
    };
  }

  private resolve!: (value: UnlockModalResult) => void;
  // private reject!: (reason?: any) => void;

  override onOpen() {
    const { contentEl } = this;
    const isLockMode = this.mode === UnlockModalMode.Lock;

    this.titleEl.setText(langText(
      isLockMode ? "unlock_modal__lock_title" : "unlock_modal__unlock_title",
    ));

    this.addKeyBlockElem(contentEl);

    if (isLockMode) {
      this.addPlaintextElem(contentEl);
    }

    new Setting(contentEl)
      .addButton((button) => {
        button
          .setButtonText(langText("general__submit_save"))
          .setCta()
          .onClick(async () => {
            const { keyName, password, plaintext } = this.result;

            if (keyName === "") {
              new Notice(langText("unlock_modal__empty_key_name_notice"));
              return;
            }
            if (
              this.mode === UnlockModalMode.Lock &&
              plaintext === ""
            ) {
              new Notice(langText("unlock_modal__empty_plaintext_notice"));
              return;
            }

            if (password === "") {
              new Notice(langText("key_modal__empty_password_notice"));
              return;
            } else if (
              !(await this.checkPassword(password, keyName))
            ) {
              new Notice(langText("unlock_modal__password_incorrect_notice"));
              return;
            }

            this.result.isSubmitted = true;
            this.close();
          });
      });
  }

  override onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.resolve(this.result);
  }

  openAndAwaitResult(): Promise<UnlockModalResult> {
    return new Promise((resolve, _reject) => {
      this.resolve = resolve;
      // this.reject = reject;
      this.open();
    });
  }

  addKeyBlockElem(contentEl: HTMLElement) {
    const isLockMode = this.mode === UnlockModalMode.Lock;

    new Setting(contentEl)
      .setName(langText("unlock_modal__select_key_input_text"))
      .addDropdown((dropdown) => {
        this.keyNames.forEach((name) => {
          dropdown.addOption(name, name);
        });
        dropdown
          .setValue(this.result.keyName)
          .onChange((value) => {
            this.result.keyName = value;
          });
      });

    new Setting(contentEl)
      .setName(langText("unlock_modal__password_input_text"))
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setValue(this.result.password)
          .onChange((value) => {
            this.result.password = value;
          });
      });
  }

  addPlaintextElem(contentEl: HTMLElement) {
    new Setting(contentEl)
      .setName(langText("unlock_modal__plaintext_input_text"))
      .addTextArea((text) => {
        text.inputEl.style.width = "100%";
        text.inputEl.style.minHeight = "200px";
        text
          .setValue(this.result.plaintext)
          .onChange((value) => {
            this.result.plaintext = value;
          });
      });
  }
}
