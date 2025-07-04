import { App, Modal, Setting, Notice } from 'npm:obsidian';

interface UnlockModalResult {
    selectedKeyGroupName: string;
    password: string;
}

export class UnlockModal extends Modal {
    private resolve: (value: UnlockModalResult) => void;
    private reject: (reason?: any) => void;
    private submitted = false;

    private keyGroupNames: string[];
    private selectedKeyGroupName: string;
    private password: string;

    constructor(app: App, keyGroupNames: string[]) {
        super(app);
        this.keyGroupNames = keyGroupNames;
        this.selectedKeyGroupName = keyGroupNames.length > 0 ? keyGroupNames[0] : '';
        this.password = '';
    };

    onOpen() {
        const { contentEl } = this;

        this.titleEl.setText('Unlock Note');

        // Key Group Dropdown
        new Setting(contentEl)
            .setName('Select Key Group')
            .addDropdown(dropdown => {
                this.keyGroupNames.forEach(name => {
                    dropdown.addOption(name, name);
                });
                dropdown.setValue(this.selectedKeyGroupName);
                dropdown.onChange(value => {
                    this.selectedKeyGroupName = value;
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
                selectedKeyGroupName: this.selectedKeyGroupName,
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
