import { App, Modal, Setting, Notice } from 'npm:obsidian';

interface UnlockModalResult {
    selectedKeyName: string;
    password: string;
}

export class UnlockModal extends Modal {
    private resolve: (value: UnlockModalResult) => void;
    private reject: (reason?: any) => void;
    private submitted = false;

    private keyNames: string[];
    private selectedKeyName: string;
    private password: string;

    constructor(app: App, keyNames: string[]) {
        super(app);
        this.keyNames = keyNames;
        this.selectedKeyName = keyNames.length > 0 ? keyNames[0] : '';
        this.password = '';
    };

    onOpen() {
        const { contentEl } = this;

        this.titleEl.setText('Unlock Note');

        // Key Dropdown
        new Setting(contentEl)
            .setName('Select Key')
            .addDropdown(dropdown => {
                this.keyNames.forEach(name => {
                    dropdown.addOption(name, name);
                });
                dropdown.setValue(this.selectedKeyName);
                dropdown.onChange(value => {
                    this.selectedKeyName = value;
                });
            });

        // Password Input
        new Setting(contentEl)
            .setName('Password')
            .addText(text => {
                text.setPlaceholder('Enter password')
                    .setValue(this.password)
                    .onChange(value => {
                        this.password = value;
                    })
                    .inputEl.type = 'password'; // Make it a password field
            });

        // Submit Button
        new Setting(contentEl)
            .addButton(button => {
                button.setButtonText('Unlock')
                    .setCta()
                    .onClick(() => {
                        this.submitted = true;
                        this.close();
                    });
            });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();

        if (this.submitted) {
            this.resolve({
                selectedKeyName: this.selectedKeyName,
                password: this.password,
            });
        } else {
            this.reject('Modal closed without submission');
        }
    }

    openAndAwaitResult(): Promise<UnlockModalResult> {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.open();
        });
    }
}
