import { App, PluginSettingTab, Setting } from 'obsidian';
import SecureVaultPlugin from '../main';

export class SecureVaultSettingTab extends PluginSettingTab {
	plugin: SecureVaultPlugin;

	constructor(app: App, plugin: SecureVaultPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: '⚙️ SecureVault+ Settings' });

		new Setting(containerEl)
			.setName('Auto-lock timeout')
			.setDesc('Lock encrypted folders after inactivity (minutes)')
			.addText(text => text
				.setPlaceholder('5')
				.setValue(String(this.plugin.settings.autoLockTimeout))
				.onChange(async (value) => {
					const timeout = parseInt(value);
					if (!isNaN(timeout) && timeout > 0) {
						this.plugin.settings.autoLockTimeout = timeout;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl)
			.setName('Stealth mode')
			.setDesc('Hide encrypted folders from file explorer when locked')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showInFileExplorer)
				.onChange(async (value) => {
					this.plugin.settings.showInFileExplorer = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable biometric unlock')
			.setDesc('Use fingerprint/Face ID on mobile (requires setup)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableBiometric)
				.onChange(async (value) => {
					this.plugin.settings.enableBiometric = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto backup')
			.setDesc('Automatically backup encrypted folders')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.backupEnabled)
				.onChange(async (value) => {
					this.plugin.settings.backupEnabled = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Backup interval')
			.setDesc('How often to create backups (hours)')
			.addText(text => text
				.setPlaceholder('24')
				.setValue(String(this.plugin.settings.backupInterval))
				.onChange(async (value) => {
					const interval = parseInt(value);
					if (!isNaN(interval) && interval > 0) {
						this.plugin.settings.backupInterval = interval;
						await this.plugin.saveSettings();
					}
				}));

		containerEl.createEl('h3', { text: '📂 Encrypted Folders' });

		if (this.plugin.settings.encryptedFolders.length === 0) {
			containerEl.createEl('p', { 
				text: 'No encrypted folders yet. Create one using the command palette.',
				cls: 'setting-item-description'
			});
		} else {
			this.plugin.settings.encryptedFolders.forEach(folder => {
				new Setting(containerEl)
					.setName(folder.path)
					.setDesc(`Status: ${folder.isLocked ? '🔒 Locked' : '🔓 Unlocked'} | Files: ${folder.encryptedFiles.length}`)
					.addButton(btn => btn
						.setButtonText('Remove')
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.encryptedFolders = 
								this.plugin.settings.encryptedFolders.filter(f => f.path !== folder.path);
							await this.plugin.saveSettings();
							this.display();
						}));
			});
		}
	}
}
