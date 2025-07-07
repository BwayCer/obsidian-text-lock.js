import { App, Modal, Notice } from "npm:obsidian";

interface KeyValueItem {
  key: string;
  value: string;
}

export class KeyValueDisplayModal extends Modal {
  private data: KeyValueItem[];

  constructor(app: App, data: KeyValueItem[]) {
    super(app);
    this.data = data;
  }

  override onOpen() {
    const { contentEl } = this;
    this.titleEl.setText("Unlocked Key-Value Data");

    this.data.forEach((item) => {
      const itemContainer = contentEl.createEl("div");
      itemContainer.addClass("textlock-key-value-row");

      const keyEl = itemContainer.createEl("span", { text: item.key + ": " });
      keyEl.addClass("textlock-key");

      const valueContainer = itemContainer.createEl("span");
      valueContainer.addClass("textlock-value-container");

      const hiddenValueEl = valueContainer.createEl("span", { text: "***" });
      hiddenValueEl.addClass("textlock-hidden-value");

      const visibleValueEl = valueContainer.createEl("span", { text: item.value });
      visibleValueEl.addClass("textlock-visible-value");
      visibleValueEl.style.display = "none"; // Hidden by default

      const actionsContainer = itemContainer.createEl("span");
      actionsContainer.addClass("textlock-key-value-actions");

      const toggleButton = actionsContainer.createEl("span", { text: "👁️" });
      toggleButton.addClass("textlock-toggle-visibility");
      toggleButton.onclick = () => {
        if (hiddenValueEl.style.display === "none") {
          hiddenValueEl.style.display = "inline";
          visibleValueEl.style.display = "none";
          toggleButton.textContent = "👁️";
        } else {
          hiddenValueEl.style.display = "none";
          visibleValueEl.style.display = "inline";
          toggleButton.textContent = "🙈";
        }
      };

      const copyButton = actionsContainer.createEl("span", { text: "📋" });
      copyButton.addClass("textlock-copy-value");
      copyButton.onclick = () => {
        navigator.clipboard.writeText(item.value);
        new Notice("Value copied to clipboard!");
      };
    });
  }

  override onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
