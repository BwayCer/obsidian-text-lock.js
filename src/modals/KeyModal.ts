import { App, Modal, Notice, Setting } from "npm:obsidian";
import { langText } from "../data.ts";
import { cryptoCan } from "../cryptoCan.ts";

const cryptoSchemes = Reflect.ownKeys(cryptoCan) as (keyof typeof cryptoCan)[];

const DEFULT_CRYPTO_SCHEMES = cryptoSchemes[0] as keyof typeof cryptoCan;

type CheckPassword = (password: string) => Promise<boolean>;

export enum KeyModalMode {
  Create,
  Rename,
  Update,
}

interface UpdateInfo {
  name: string;
  oldPassword: string;
  cryptoScheme: keyof typeof cryptoCan;
  password: string;
  confirmPassword: string;
}

export interface KeyModalResult {
  isSubmitted: boolean;
  name: string;
  oldPassword: string;
  cryptoScheme: keyof typeof cryptoCan;
  password: string;
}

export class KeyModal extends Modal {
  private mode: KeyModalMode;
  private keyName: string | undefined;
  private checkPassword: CheckPassword | undefined;

  constructor(
    app: App,
    mode: KeyModalMode,
    keyName?: string,
    checkPassword?: CheckPassword,
  ) {
    super(app);
    this.mode = mode;
    this.keyName = keyName;
    this.checkPassword = checkPassword;
  }

  private resolve!: (value: KeyModalResult) => void;
  // private reject!: (reason?: any) => void;
  private result: KeyModalResult = {
    isSubmitted: false,
    name: "",
    oldPassword: "",
    cryptoScheme: DEFULT_CRYPTO_SCHEMES,
    password: "",
  };

  override onOpen() {
    const { contentEl } = this;

    const updateInfo: UpdateInfo = {
      name: "",
      oldPassword: "",
      cryptoScheme: DEFULT_CRYPTO_SCHEMES,
      password: "",
      confirmPassword: "",
    };

    switch (this.mode) {
      case KeyModalMode.Create:
        this.titleEl.setText(langText("key_modal__create_title"));
        this.addNameTextElem(contentEl, updateInfo);
        this.addPasswordTextElem(contentEl, updateInfo, this.mode);
        break;
      case KeyModalMode.Rename:
        this.titleEl.setText(
          langText("key_modal__rename_title", { name: this.keyName ?? "" }),
        );
        this.addNameTextElem(contentEl, updateInfo);
        break;
      case KeyModalMode.Update:
        this.titleEl.setText(
          langText("key_modal__update_title", { name: this.keyName ?? "" }),
        );
        this.addPasswordTextElem(contentEl, updateInfo, this.mode);
        break;
    }

    new Setting(contentEl).addButton((button) =>
      button
        .setButtonText(langText("general__submit"))
        .onClick(async () => {
          if (this.mode !== KeyModalMode.Update) {
            if (updateInfo.name === "") {
              new Notice(langText("key_modal__empty_name_notice"));
              return;
            }

            this.result.name = updateInfo.name;
          }
          if (this.mode !== KeyModalMode.Rename) {
            if (updateInfo.password === "") {
              new Notice(langText("key_modal__empty_password_notice"));
              return;
            }
            if (updateInfo.password !== updateInfo.confirmPassword) {
              new Notice(langText("key_modal__password_not_match_notice"));
              return;
            }

            if (this.mode === KeyModalMode.Update) {
              // 驗證密碼正確性
              if (
                updateInfo.oldPassword === "" ||
                typeof this.checkPassword !== "function" ||
                !(await this.checkPassword(updateInfo.oldPassword))
              ) {
                new Notice(langText("key_modal__password_incorrect_notice"));
                return;
              }

              this.result.oldPassword = updateInfo.oldPassword;
            }

            this.result.cryptoScheme = updateInfo.cryptoScheme;
            this.result.password = updateInfo.password;
          }

          this.result.isSubmitted = true;
          this.close();
        })
    );
  }

  override onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.resolve(this.result);
  }

  openAndAwaitResult(): Promise<KeyModalResult> {
    return new Promise((resolve, _reject) => {
      this.resolve = resolve;
      // this.reject = reject;
      this.open();
    });
  }

  addNameTextElem(
    contentEl: HTMLElement,
    updateInfo: UpdateInfo,
  ) {
    new Setting(contentEl)
      .setName(langText("key_modal__name_input_text"))
      .addText((text) =>
        text
          .onChange((value) => (updateInfo.name = value))
      );
  }

  addPasswordTextElem(
    contentEl: HTMLElement,
    updateInfo: UpdateInfo,
    mode: KeyModalMode,
  ) {
    const isUpdateMode = mode === KeyModalMode.Update;

    const title = langText(
      isUpdateMode
        ? "key_modal__new_password_input_text"
        : "key_modal__password_input_text",
    );

    if (isUpdateMode) {
      new Setting(contentEl)
        .setName(langText("key_modal__old_password_input_text"))
        .addText((text) =>
          text.onChange((value) => (updateInfo.oldPassword = value))
        );
    } else {
      new Setting(contentEl)
        .setName(langText("key_modal__crypto_scheme_select_text"))
        .addDropdown((dropdown) => {
          cryptoSchemes.forEach((name) => {
            dropdown.addOption(name, name);
          });
          dropdown.setValue(DEFULT_CRYPTO_SCHEMES);
          dropdown.onChange((value) => {
            updateInfo.cryptoScheme = value as keyof typeof cryptoCan;
          });
        });
    }

    new Setting(contentEl)
      .setName(title)
      .addText((text) =>
        text.onChange((value) => (updateInfo.password = value))
      );

    new Setting(contentEl)
      .setName(langText("key_modal__confirm_password_input_text", { title }))
      .addText((text) =>
        text.onChange((value) => (updateInfo.confirmPassword = value))
      );
  }
}
