import {
  App,
  Component,
  MarkdownRenderer,
  Modal,
  Notice,
  Setting,
} from "npm:obsidian";
import { langText } from "../data.ts";

interface KeyValueItem {
  key: string;
  value: string;
}

export class DisplayModal extends Modal {
  private content: string;
  private component: Component;

  constructor(app: App, component: Component, content: string) {
    super(app);
    this.component = component;
    this.content = content;
  }

  override onOpen() {
    const { contentEl } = this;
    this.titleEl.setText(langText("display_modal__title"));

    const keyValuePairs = this.parseKeyValueContent(this.content);
    if (keyValuePairs) {
      this.displayByKeyVal(contentEl, keyValuePairs);
    } else {
      this.displayByMarkdown(contentEl);
    }
  }

  override onClose() {
    const { contentEl } = this;
    contentEl.empty();
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

  displayByMarkdown(contentEl: HTMLElement) {
    const renderContainer = contentEl.createEl("div");

    // 以 Markdown 風格顯示
    MarkdownRenderer.render(
      this.app,
      this.content,
      renderContainer,
      "",
      this.component,
    );

    new Setting(contentEl)
      .addButton((button) => {
        button
          .setButtonText(langText("general__copy"))
          .onClick(() => {
            navigator.clipboard.writeText(this.content);
            new Notice(langText("general__copied_to_clipboard"));
          });
      });
  }

  displayByKeyVal(contentEl: HTMLElement, data: KeyValueItem[]) {
    data.forEach((item) => {
      const lineContainer = contentEl.createDiv("setting-item");
      lineContainer.addClass("text-lock--display-modal--line-container");

      const lineInfoBox = lineContainer.createDiv("setting-item-info");
      lineInfoBox.createDiv("setting-item-name").setText(item.key + " : ");

      const lineControlBox = lineContainer.createDiv("setting-item-control");

      // 秘密值畫面
      const secretValue = item.value;
      const secretBox = lineControlBox.createDiv(
        "text-lock--display-modal--line-container--value",
      );

      secretBox
        .createDiv("mark-toggle-btn")
        .onclick = () => {
          const attrName = "data-value";
          if (secretBox.hasAttribute(attrName)) {
            secretBox.removeAttribute(attrName);
          } else {
            secretBox.setAttribute("data-value", secretValue);
          }
        };

      secretBox
        .createDiv("mark-copy-btn")
        .onclick = () => {
          navigator.clipboard.writeText(secretValue);
          new Notice(langText("general__copied_to_clipboard"));
        };
    });
  }
}
