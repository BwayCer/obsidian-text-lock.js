import { App, Modal, Setting } from "npm:obsidian";
import { configPlaceholder, langText } from "./data.ts";

export interface ImportModalResult {
  isSubmitted: boolean;
  isChanged: boolean;
  data: string;
}

export class ImportModal extends Modal {
  private data: string;

  constructor(app: App, currentData: string) {
    super(app);
    this.data = currentData;
  }

  private resolve!: (value: ImportModalResult) => void;
  // private reject!: (reason?: any) => void;
  private result: ImportModalResult = {
    isSubmitted: false,
    isChanged: false,
    data: "",
  };

  override onOpen() {
    const { contentEl } = this;
    this.titleEl.setText(langText("import_modal__title"));

    const textBoxElem = contentEl.createDiv("setting-item");
    const textElem = contentEl.createEl("textarea", {
      text: this.data,
    });
    textElem.style.width = "100%";
    textElem.style.height = "30vh";
    textElem.placeholder = configPlaceholder;
    textElem.addEventListener("change", (evt) => {
      this.result.isChanged = true;
      this.result.data = (evt.currentTarget as HTMLTextAreaElement)?.value ??
        "";
    });
    textBoxElem.appendChild(textElem);

    new Setting(contentEl).addButton((button) =>
      button
        .setButtonText(langText("import_modal__btn_text"))
        .onClick(() => {
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

  openAndAwaitResult(): Promise<ImportModalResult> {
    return new Promise((resolve, _reject) => {
      this.resolve = resolve;
      // this.reject = reject;
      this.open();
    });
  }
}
