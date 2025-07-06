import {
  App,
  Component,
  MarkdownRenderer,
  Modal,
  Notice,
  Setting,
} from "npm:obsidian";

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
    this.titleEl.setText("Unlocked Content");

    // Create a container for the rendered content
    const renderContainer = contentEl.createEl("div");
    renderContainer.addClass("notelock-display-content");

    // Use MarkdownRenderer to display the content
    MarkdownRenderer.render(
      this.app,
      this.content,
      renderContainer,
      "",
      this.component,
    );

    // Add a setting for the copy button
    new Setting(contentEl)
      .setClass("notelock-copy-button-container")
      .addButton((button) => {
        button.setButtonText("Copy")
          .onClick(() => {
            navigator.clipboard.writeText(this.content);
            new Notice("Content copied to clipboard.");
          });
      });
  }

  override onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
