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

		// Encryption Algorithm Selection
		new Setting(containerEl)
			.setName('🔐 Encryption Algorithm')
			.setDesc('Choose encryption algorithm for new encrypted folders. Existing folders keep their algorithm.')
			.addDropdown(dropdown => dropdown
				.addOption('AES-256-GCM', 'AES-256-GCM (Standard, Recommended)')
				.addOption('ChaCha20-Poly1305', 'ChaCha20-Poly1305 (Modern, Faster)')
				.setValue(this.plugin.settings.encryptionAlgorithm)
				.onChange(async (value) => {
					this.plugin.settings.encryptionAlgorithm = value as 'AES-256-GCM' | 'ChaCha20-Poly1305';
					await this.plugin.saveSettings();
					// Update crypto service
					const { CryptoService } = await import('./crypto');
					CryptoService.setAlgorithm(this.plugin.settings.encryptionAlgorithm);
				}));

		// Algorithm Info
		const algoInfo = containerEl.createDiv('algorithm-info');
		algoInfo.style.backgroundColor = 'var(--background-secondary)';
		algoInfo.style.padding = '15px';
		algoInfo.style.borderRadius = '8px';
		algoInfo.style.marginBottom = '20px';
		algoInfo.style.borderLeft = '3px solid var(--text-accent)';
		
		algoInfo.createEl('p', { 
			text: '📌 Algorithm Details:',
			cls: 'setting-item-name'
		});
		
		const ul = algoInfo.createEl('ul');
		ul.style.marginLeft = '20px';
		ul.style.fontSize = '0.9em';
		ul.innerHTML = `
			<li style="margin: 8px 0;"><strong>AES-256-GCM</strong>: Industry standard (NSA approved), widely supported, battle-tested security ✅</li>
			<li style="margin: 8px 0;"><strong>ChaCha20-Poly1305</strong>: Modern cipher by Google, faster on mobile/low-power devices, used in TLS 1.3 🚀</li>
		`;
		
		const note = algoInfo.createEl('p');
		note.style.marginTop = '10px';
		note.style.fontSize = '0.9em';
		note.style.color = 'var(--text-warning)';
		note.innerHTML = '⚠️ <strong>Important:</strong> This setting only affects NEW encrypted folders. Existing folders automatically use their original algorithm (auto-detected on decrypt).';

		containerEl.createEl('hr');

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
				// Get algorithm from first encrypted file
				let folderAlgorithm = 'Unknown';
				if (folder.encryptedFiles.length > 0) {
					// We'll show the algorithm if we can detect it
					folderAlgorithm = 'Mixed/Auto-detect';
				}
				
				new Setting(containerEl)
					.setName(folder.path)
					.setDesc(`Status: ${folder.isLocked ? '🔒 Locked' : '🔓 Unlocked'} | Files: ${folder.encryptedFiles.length} | Algorithm: Auto-detect`)
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
