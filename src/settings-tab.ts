import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import SecureVaultPlugin from '../main';
import { AccessLogModal } from './modals';
import { generateKeyFile } from './utils';

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

		// ======= PASSWORD SECURITY SECTION =======
		containerEl.createEl('h3', { text: '🔑 Password Security' });

		new Setting(containerEl)
			.setName('Minimum password length')
			.setDesc('Minimum characters required for passwords (8-64)')
			.addText(text => text
				.setPlaceholder('8')
				.setValue(String(this.plugin.settings.passwordMinLength))
				.onChange(async (value) => {
					const len = parseInt(value);
					if (!isNaN(len) && len >= 8 && len <= 64) {
						this.plugin.settings.passwordMinLength = len;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl)
			.setName('Require strong passwords')
			.setDesc('Enforce strong password requirements (uppercase, lowercase, numbers, symbols)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.requireStrongPassword)
				.onChange(async (value) => {
					this.plugin.settings.requireStrongPassword = value;
					await this.plugin.saveSettings();
				}));

		// ======= KEY FILE SECTION =======
		containerEl.createEl('h3', { text: '🔐 Key File (Two-Factor Encryption)' });

		new Setting(containerEl)
			.setName('Enable key file support')
			.setDesc('Require a key file in addition to password (two-factor encryption)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableKeyFile)
				.onChange(async (value) => {
					this.plugin.settings.enableKeyFile = value;
					await this.plugin.saveSettings();
					this.display(); // Refresh to show/hide key file options
				}));

		if (this.plugin.settings.enableKeyFile) {
			new Setting(containerEl)
				.setName('Key file path')
				.setDesc(this.plugin.settings.keyFilePath 
					? `Current: ${this.plugin.settings.keyFilePath}` 
					: 'No key file set. Generate one below.')
				.addButton(btn => btn
					.setButtonText('📁 Choose Key File')
					.onClick(async () => {
						// In a real implementation, this would open a file picker
						new Notice('⚠️ Use the "Generate Key File" button to create a new key file');
					}))
				.addButton(btn => btn
					.setButtonText('🎲 Generate Key File')
					.setCta()
					.onClick(async () => {
						const keyContent = generateKeyFile();
						const fileName = `securevault-key-${Date.now()}.key`;
						
						try {
							// Save to vault root
							await this.app.vault.create(fileName, keyContent);
							this.plugin.settings.keyFilePath = fileName;
							await this.plugin.saveSettings();
							
							new Notice(`✅ Key file generated: ${fileName}\n⚠️ BACKUP THIS FILE! Loss = permanent data loss!`, 10000);
							this.display();
						} catch (error) {
							new Notice(`❌ Failed to generate key file: ${error.message}`);
						}
					}));

			if (this.plugin.settings.keyFilePath) {
				new Setting(containerEl)
					.setName('Clear key file')
					.setDesc('⚠️ Remove key file requirement (you will NOT be able to unlock existing folders encrypted with key file!)')
					.addButton(btn => btn
						.setButtonText('Clear')
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.keyFilePath = '';
							await this.plugin.saveSettings();
							new Notice('⚠️ Key file cleared. Existing encrypted folders may become inaccessible!');
							this.display();
						}));
			}
		}

		// ======= ACCESS LOG SECTION =======
		containerEl.createEl('h3', { text: '📊 Access Logging' });

		new Setting(containerEl)
			.setName('Enable access logging')
			.setDesc('Track all lock/unlock operations with timestamps')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAccessLog)
				.onChange(async (value) => {
					this.plugin.settings.enableAccessLog = value;
					await this.plugin.saveSettings();
					this.display();
				}));

		if (this.plugin.settings.enableAccessLog) {
			new Setting(containerEl)
				.setName('Maximum log entries')
				.setDesc('Keep last N log entries (older entries auto-deleted)')
				.addText(text => text
					.setPlaceholder('100')
					.setValue(String(this.plugin.settings.maxAccessLogs))
					.onChange(async (value) => {
						const max = parseInt(value);
						if (!isNaN(max) && max > 0 && max <= 10000) {
							this.plugin.settings.maxAccessLogs = max;
							await this.plugin.saveSettings();
						}
					}));

			new Setting(containerEl)
				.setName('View access logs')
				.setDesc(`Current logs: ${this.plugin.settings.accessLogs.length} entries`)
				.addButton(btn => btn
					.setButtonText('📖 View Logs')
					.setCta()
					.onClick(() => {
						new AccessLogModal(this.app, this.plugin.settings).open();
					}))
				.addButton(btn => btn
					.setButtonText('🗑️ Clear All Logs')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.accessLogs = [];
						await this.plugin.saveSettings();
						new Notice('✅ All access logs cleared');
						this.display();
					}));
		}

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
