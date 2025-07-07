import { App, Modal, Setting } from "npm:obsidian";

interface EditModalResult {
  selectedKeyName: string;
  plaintext: string;
}

export class EditModal extends Modal {
  private resolve!: (value: EditModalResult) => void;
  private reject!: (reason?: any) => void;
  private submitted = false;

  private keyNames: string[];
  private selectedKeyName: string;
  private plaintext: string;

  constructor(app: App, keyNames: string[], initialPlaintext: string) {
    super(app);
    this.keyNames = keyNames;
    this.selectedKeyName = keyNames.length > 0 ? keyNames[0] : "";
    this.plaintext = initialPlaintext;
  }

  override onOpen() {
    const { contentEl } = this;

    this.titleEl.setText("Edit Text");

    // Key Dropdown
    new Setting(contentEl)
      .setName("Select Key")
      .addDropdown((dropdown) => {
        this.keyNames.forEach((name) => {
          dropdown.addOption(name, name);
        });
        dropdown.setValue(this.selectedKeyName);
        dropdown.onChange((value) => {
          this.selectedKeyName = value;
        });
      });

    // Plaintext Input
    new Setting(contentEl)
      .setName("Plaintext")
      .addTextArea((text) => {
        text.inputEl.style.width = "100%";
        text.inputEl.style.minHeight = "200px";
        text.setPlaceholder("Enter plaintext")
          .setValue(this.plaintext)
          .onChange((value) => {
            this.plaintext = value;
          });
      });

    // Submit Button
    new Setting(contentEl)
      .addButton((button) => {
        button.setButtonText("Save")
          .setCta()
          .onClick(() => {
            this.submitted = true;
            this.close();
          });
      });
  }

  override onClose() {
    const { contentEl } = this;
    contentEl.empty();

    if (this.submitted) {
      this.resolve({
        selectedKeyName: this.selectedKeyName,
        plaintext: this.plaintext,
      });
    } else {
      this.reject("Modal closed without submission");
    }
  }

  openAndAwaitResult(): Promise<EditModalResult> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.open();
    });
  }
}
