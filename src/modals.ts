import { App, Modal, Notice, Setting } from 'obsidian';

export class PasswordModal extends Modal {
	private password: string = '';
	private onSubmit: (password: string) => void;

	constructor(app: App, onSubmit: (password: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: '🔐 Enter Master Password' });

		new Setting(contentEl)
			.setName('Password')
			.addText(text => text
				.setPlaceholder('Enter password')
				.onChange(value => this.password = value)
				.inputEl.type = 'password');

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Unlock')
				.setCta()
				.onClick(() => {
					if (this.password.length < 6) {
						new Notice('❌ Password must be at least 6 characters');
						return;
					}
					this.close();
					this.onSubmit(this.password);
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class CreateFolderModal extends Modal {
	private folderPath: string = 'SecureVault';
	private password: string = '';
	private confirmPassword: string = '';
	private onSubmit: (folderPath: string, password: string) => void;

	constructor(app: App, onSubmit: (folderPath: string, password: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: '🔒 Create Encrypted Folder' });

		new Setting(contentEl)
			.setName('Folder Path')
			.setDesc('Default: SecureVault (or use SecureVault/SubFolder)')
			.addText(text => text
				.setPlaceholder('SecureVault')
				.setValue('SecureVault')
				.onChange(value => this.folderPath = value || 'SecureVault'));

		new Setting(contentEl)
			.setName('Password')
			.addText(text => text
				.setPlaceholder('Enter password')
				.onChange(value => this.password = value)
				.inputEl.type = 'password');

		new Setting(contentEl)
			.setName('Confirm Password')
			.addText(text => text
				.setPlaceholder('Confirm password')
				.onChange(value => this.confirmPassword = value)
				.inputEl.type = 'password');

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Create & Encrypt')
				.setCta()
				.onClick(() => {
					if (!this.folderPath) {
						new Notice('❌ Folder path is required');
						return;
					}
					if (this.password.length < 6) {
						new Notice('❌ Password must be at least 6 characters');
						return;
					}
					if (this.password !== this.confirmPassword) {
						new Notice('❌ Passwords do not match');
						return;
					}
					this.close();
					this.onSubmit(this.folderPath, this.password);
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class QuickUnlockPanel {
	private containerEl: HTMLElement;
	private isLocked: boolean = true;

	constructor(private parentEl: HTMLElement) {
		this.containerEl = parentEl.createDiv('securevault-quick-unlock');
		this.render();
	}

	render() {
		this.containerEl.empty();

		if (this.isLocked) {
			this.containerEl.createEl('div', { 
				text: '🔒 SecureVault locked',
				cls: 'securevault-status-locked'
			});
		} else {
			this.containerEl.createEl('div', { 
				text: '🔓 SecureVault unlocked',
				cls: 'securevault-status-unlocked'
			});
		}
	}

	setLockState(locked: boolean) {
		this.isLocked = locked;
		this.render();
	}

	destroy() {
		this.containerEl.remove();
	}
}
