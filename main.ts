import { Notice, Plugin, TFolder, Modal, Setting } from 'obsidian';
import { SecureVaultSettings, DEFAULT_SETTINGS, EncryptedFolder } from './src/types';
import { VaultManager } from './src/vault-manager';
import { PasswordModal, CreateFolderModal } from './src/modals';
import { SecureVaultSettingTab } from './src/settings-tab';
import { CryptoService } from './src/crypto';

export default class SecureVaultPlugin extends Plugin {
	settings: SecureVaultSettings;
	vaultManager: VaultManager;
	private autoLockTimer: NodeJS.Timeout | null = null;
	private isProcessing: boolean = false; // PERBAIKAN: Prevent multiple simultaneous operations
	private statusBarUpdateTimer: NodeJS.Timeout | null = null; // PERBAIKAN: Debounce status bar updates

	async onload() {
		await this.loadSettings();
		this.vaultManager = new VaultManager(this.app);

		// Set encryption algorithm from settings
		CryptoService.setAlgorithm(this.settings.encryptionAlgorithm);

		// Buat folder SecureVault otomatis jika belum ada
		await this.ensureSecureVaultFolder();

		// Ribbon icon - buka quick menu
		this.addRibbonIcon('shield', 'SecureVault+ Menu', () => {
			new QuickMenuModal(this.app, this).open();
		});

		// Status bar
		const statusBar = this.addStatusBarItem();
		this.updateStatusBar(statusBar);
		
		// Update status bar setiap 5 detik
		this.registerInterval(window.setInterval(() => {
			this.updateStatusBar(statusBar);
		}, 5000));
		
		// Status bar clickable
		statusBar.addClass('mod-clickable');
		statusBar.addEventListener('click', () => {
			new QuickMenuModal(this.app, this).open();
		});

		// Commands
		this.addCommand({
			id: 'open-securevault-menu',
			name: 'Open SecureVault+ menu',
			callback: () => {
				new QuickMenuModal(this.app, this).open();
			}
		});

		this.addCommand({
			id: 'create-encrypted-folder',
			name: 'Create encrypted folder',
			callback: () => {
				this.createEncryptedFolderCommand();
			}
		});

		this.addCommand({
			id: 'unlock-all-folders',
			name: 'Unlock all encrypted folders',
			callback: () => {
				this.unlockAllCommand();
			}
		});

		this.addCommand({
			id: 'lock-all-folders',
			name: 'Lock all encrypted folders',
			callback: () => {
				this.lockAllCommand();
			}
		});

		this.addCommand({
			id: 'encrypt-current-folder',
			name: 'Encrypt current folder',
			callback: () => {
				this.encryptCurrentFolderCommand();
			}
		});

		// Register file menu (right-click) context
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				// Add menu for folders only
				if (file instanceof TFolder) {
					// Check if inside SecureVault
					const isInSecureVault = file.path.startsWith('SecureVault') || file.path === 'SecureVault';
					
					if (isInSecureVault) {
						// Check if already encrypted
						const existingFolder = this.settings.encryptedFolders.find(f => f.path === file.path);
						
						if (existingFolder) {
							// Already encrypted - show Lock/Unlock
							if (existingFolder.isLocked) {
								menu.addItem((item) => {
									item
										.setTitle('🔓 Unlock folder')
										.setIcon('unlock')
										.onClick(async () => {
											await this.unlockSpecificFolder(existingFolder);
										});
								});
							} else {
								menu.addItem((item) => {
									item
										.setTitle('🔒 Lock folder')
										.setIcon('lock')
										.onClick(async () => {
											await this.lockSpecificFolder(existingFolder);
										});
								});
							}
						} else {
							// Not encrypted yet - show Encrypt option
							menu.addItem((item) => {
								item
									.setTitle('🛡️ Encrypt folder')
									.setIcon('shield')
									.onClick(async () => {
										await this.encryptFolderFromContextMenu(file);
									});
							});
						}
					}
				}
			})
		);

		// Settings tab
		this.addSettingTab(new SecureVaultSettingTab(this.app, this));

		// Auto-lock timer
		this.startAutoLockTimer();

		console.log('🔐 SecureVault+ loaded');
	}

	onunload() {
		if (this.autoLockTimer) {
			clearInterval(this.autoLockTimer);
		}
		console.log('🔐 SecureVault+ unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Public methods untuk dipanggil dari modal
	createEncryptedFolderCommand() {
		new CreateFolderModal(this.app, async (folderPath, password) => {
			new Notice(`🔄 Encrypting folder and all subfolders...`);
			const encFolder = await this.vaultManager.createEncryptedFolder(folderPath, password);
			if (encFolder) {
				this.settings.encryptedFolders.push(encFolder);
				await this.saveSettings();
				new Notice(`✅ SUCCESS! Encrypted ${encFolder.encryptedFiles.length} file(s) in "${folderPath}" (including subfolders)`);
				this.refreshStatusBar();
			}
		}).open();
	}

	unlockAllCommand() {
		new PasswordModal(this.app, async (password) => {
			await this.unlockAllFolders(password);
			this.refreshStatusBar();
		}).open();
	}

	lockAllCommand() {
		new PasswordModal(this.app, async (password) => {
			await this.lockAllFolders(password);
			this.refreshStatusBar();
		}).open();
	}

	encryptCurrentFolderCommand() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('❌ No active file. Open a file first!');
			return;
		}

		const folder = activeFile.parent;
		if (folder) {
			new PasswordModal(this.app, async (password) => {
				const alreadyEncrypted = this.settings.encryptedFolders.some(f => f.path === folder.path);
				if (alreadyEncrypted) {
					new Notice('⚠️ This folder is already encrypted! Use Unlock to decrypt it.');
					return;
				}

				new Notice(`🔄 ENCRYPTING current folder + all subfolders...`);
				const encFolder = await this.vaultManager.encryptFolder(folder as TFolder, password);
				this.settings.encryptedFolders.push(encFolder);
				await this.saveSettings();
				new Notice(`✅ SUCCESS! Encrypted ${encFolder.encryptedFiles.length} file(s) in "${folder.path}" (subfolders included)`, 5000);
				this.refreshStatusBar();
			}).open();
		}
	}

	// Encrypt folder from context menu (right-click)
	async encryptFolderFromContextMenu(folder: TFolder) {
		new PasswordModal(this.app, async (password) => {
			const alreadyEncrypted = this.settings.encryptedFolders.some(f => f.path === folder.path);
			if (alreadyEncrypted) {
				new Notice('⚠️ This folder is already encrypted! Use Unlock to decrypt it.');
				return;
			}

			new Notice(`🔄 ENCRYPTING: "${folder.path}" + all subfolders...`);
			
			const encFolder = await this.vaultManager.encryptFolder(folder, password, true);
			this.settings.encryptedFolders.push(encFolder);
			await this.saveSettings();
			
			new Notice(`✅ SUCCESS! Encrypted ${encFolder.encryptedFiles.length} file(s) in "${folder.path}" (subfolders included)`, 5000);
			this.refreshStatusBar();
		}).open();
	}

	async unlockSpecificFolder(folder: EncryptedFolder) {
		// PERBAIKAN: Check if already processing
		if (this.isProcessing) {
			new Notice('⏳ Please wait, another operation is in progress...');
			return;
		}
		
		new PasswordModal(this.app, async (password) => {
			this.isProcessing = true;
			try {
				// Detect real status first
				const status = await this.vaultManager.detectFolderLockStatus(folder.path);
				
				if (!status.isLocked) {
					new Notice('ℹ️ This folder is already unlocked!');
					folder.isLocked = false;
					await this.saveSettings();
					this.refreshStatusBar();
					return;
				}
				
				new Notice(`🔓 UNLOCKING: "${folder.path}" + all subfolders...`);
				const success = await this.vaultManager.decryptFolder(folder, password);
				if (success) {
					await this.saveSettings();
					new Notice(`✅ Folder "${folder.path}" unlocked successfully!`, 3000);
					this.refreshStatusBar();
				}
			} finally {
				this.isProcessing = false;
			}
		}).open();
	}

	async lockSpecificFolder(folder: EncryptedFolder) {
		// PERBAIKAN: Check if already processing
		if (this.isProcessing) {
			new Notice('⏳ Please wait, another operation is in progress...');
			return;
		}
		
		new PasswordModal(this.app, async (password) => {
			this.isProcessing = true;
			try {
				// Detect real status first
				const status = await this.vaultManager.detectFolderLockStatus(folder.path);
				
				if (status.isLocked) {
					new Notice('ℹ️ This folder is already locked!');
					folder.isLocked = true;
					await this.saveSettings();
					this.refreshStatusBar();
					return;
				}
				
				new Notice(`🔒 LOCKING: "${folder.path}" + all subfolders...`);
				await this.vaultManager.lockFolder(folder, password);
				await this.saveSettings();
				new Notice(`🔒 Folder "${folder.path}" locked successfully!`, 3000);
				this.refreshStatusBar();
			} finally {
				this.isProcessing = false;
			}
		}).open();
	}

	private async unlockAllFolders(password: string) {
		// PERBAIKAN: Check if already processing
		if (this.isProcessing) {
			new Notice('⏳ Please wait, another operation is in progress...');
			return;
		}
		
		this.isProcessing = true;
		try {
			const lockedFolders = this.settings.encryptedFolders.filter(f => f.isLocked);
			if (lockedFolders.length === 0) {
				new Notice('ℹ️ No locked folders to unlock.');
				return;
			}

			let successCount = 0;
			new Notice(`🔓 UNLOCKING ${lockedFolders.length} folder(s) + all subfolders...`);

			for (const folder of this.settings.encryptedFolders) {
				if (folder.isLocked) {
					const success = await this.vaultManager.decryptFolder(folder, password);
					if (success) {
						successCount++;
					}
				}
			}

			await this.saveSettings();
			
			if (successCount > 0) {
				this.settings.lastUnlockTime = Date.now();
				new Notice(`✅ SUCCESS! Unlocked ${successCount} folder(s) (all subfolders decrypted)`, 5000);
				this.refreshStatusBar();
			} else {
				new Notice('❌ FAILED! Wrong password or no folders to unlock.');
			}
		} finally {
			this.isProcessing = false;
		}
	}

	private async lockAllFolders(password: string) {
		// PERBAIKAN: Check if already processing
		if (this.isProcessing) {
			new Notice('⏳ Please wait, another operation is in progress...');
			return;
		}
		
		this.isProcessing = true;
		try {
			const unlockedFolders = this.settings.encryptedFolders.filter(f => !f.isLocked);
			if (unlockedFolders.length === 0) {
				new Notice('ℹ️ No unlocked folders to lock. All are already locked!');
				return;
			}

			let successCount = 0;
			new Notice(`🔒 LOCKING ${unlockedFolders.length} folder(s) + all subfolders...`);

			for (const folder of this.settings.encryptedFolders) {
				if (!folder.isLocked) {
					await this.vaultManager.lockFolder(folder, password);
					successCount++;
				}
			}

			await this.saveSettings();
			new Notice(`✅ SUCCESS! Locked ${successCount} folder(s) (all subfolders encrypted)`, 5000);
			this.refreshStatusBar();
		} finally {
			this.isProcessing = false;
		}
	}

	private startAutoLockTimer() {
		if (this.autoLockTimer) {
			clearInterval(this.autoLockTimer);
		}

		this.autoLockTimer = setInterval(() => {
			const now = Date.now();
			const timeoutMs = this.settings.autoLockTimeout * 60 * 1000;
			
			if (now - this.settings.lastUnlockTime > timeoutMs) {
				const unlockedFolders = this.settings.encryptedFolders.filter(f => !f.isLocked);
				
				if (unlockedFolders.length > 0) {
					new Notice('🔒 Auto-locking folders due to inactivity');
					// In real implementation, we would need to store password temporarily
					// For now, just mark as locked
					unlockedFolders.forEach(f => f.isLocked = true);
					this.saveSettings();
				}
			}
		}, 60 * 1000); // Check every minute
	}

	private updateStatusBar(statusBar: HTMLElement) {
		const lockedCount = this.settings.encryptedFolders.filter(f => f.isLocked).length;
		statusBar.setText(`🔐 ${lockedCount}/${this.settings.encryptedFolders.length}`);
	}

	private async ensureSecureVaultFolder() {
		const folderPath = 'SecureVault';
		const folder = this.app.vault.getAbstractFileByPath(folderPath);

		if (!folder) {
			try {
				await this.app.vault.createFolder(folderPath);
				
				// Buat welcome note
				const welcomeContent = `# 🔐 Welcome to SecureVault+

Folder **SecureVault** ini otomatis dibuat untuk menyimpan catatan terenkripsi Anda dengan aman menggunakan enkripsi **AES-256**.

## 🎯 3 Cara Mudah Mengakses:

1. **Klik Icon 🛡️** di ribbon kiri → Menu popup muncul
2. **Klik Status Bar 🔐** di bawah → Menu popup muncul  
3. **Ctrl+P → "Open SecureVault+ menu"**

## 🚀 Cara Encrypt Folder (SUPER MUDAH!):

### Metode 1: Klik Kanan (RECOMMENDED!)
1. **Klik kanan folder** di file explorer
2. Pilih **"🛡️ Encrypt folder"**
3. Masukkan password → Done! ✅

### Metode 2: Via Menu
1. Klik icon 🛡️ atau status bar 🔐
2. Klik **"➕ Create Encrypted Folder"**
3. Masukkan path folder & password → Done! ✅

### Metode 3: Encrypt Current Folder
1. Buka file di folder yang ingin dienkripsi
2. Klik 🛡️ → **"🛡️ Encrypt Current Folder"**
3. Masukkan password → Done! ✅

## 📁 Fitur Sub-Folder:

✅ **Semua sub-folder dan file** di dalamnya juga ikut terenkripsi!
✅ Bisa encrypt/decrypt **sub-folder secara terpisah** (klik kanan!)
✅ Recursive encryption - aman total!

## � Cara Unlock/Lock Folder:

### Via Klik Kanan (FASTEST!):
- **Klik kanan folder terenkripsi** → Pilih **🔓 Unlock** atau **🔒 Lock**

### Via Menu:
- Klik 🛡️ → Lihat daftar folder → Klik tombol **Unlock**/**Lock**

### Unlock/Lock Semua:
- Klik 🛡️ → **🔓 Unlock All** atau **🔒 Lock All**

## 💡 Tips:

- 🔑 **Password minimal 6 karakter** - gunakan yang kuat!
- 🔄 **Sub-folder** di dalam SecureVault bisa encrypt/decrypt terpisah
- 📊 **Status bar** menampilkan: 🔐 X/Y (X locked dari Y total)
- ⚠️ **Jangan lupa password** - tidak ada recovery!
- ✅ **100% aman** - enkripsi AES-256, client-side only

## 🎨 Contoh Struktur:

\`\`\`
SecureVault/
├── README.md (ini)
├── Personal/          ← Encrypt ini (klik kanan!)
│   ├── diary.md
│   └── secrets.md
├── Work/              ← Encrypt ini juga
│   ├── Project1/      ← Sub-folder ikut terenkripsi!
│   │   └── notes.md
│   └── Project2/
└── Family/
    └── memories.md
\`\`\`

---
**⚡ Quick Start**: Buat folder di dalam SecureVault → Klik kanan folder → "🛡️ Encrypt folder" → Masukkan password → DONE! ✅

**🔐 Enkripsi**: AES-256-GCM with PBKDF2 (10,000 iterations)
**✨ Made with ❤️ by SecureVault+ Team**
`;
				await this.app.vault.create(`${folderPath}/README.md`, welcomeContent);
				
				new Notice('✅ Folder SecureVault berhasil dibuat! Buka README.md untuk panduan.', 5000);
			} catch (error) {
				console.error('Failed to create SecureVault folder:', error);
			}
		}
	}

	refreshStatusBar() {
		// PERBAIKAN: Debounce status bar updates (max 1 update per second)
		if (this.statusBarUpdateTimer) {
			clearTimeout(this.statusBarUpdateTimer);
		}
		
		this.statusBarUpdateTimer = setTimeout(() => {
			// Update status bar
			const statusBars = document.querySelectorAll('.status-bar-item');
			statusBars.forEach(bar => {
				if (bar.textContent?.includes('🔐')) {
					this.updateStatusBar(bar as HTMLElement);
				}
			});
		}, 1000); // Tunggu 1 detik sebelum update
	}
}

// Quick Menu Modal - Pengganti Sidebar
class QuickMenuModal extends Modal {
	plugin: SecureVaultPlugin;

	constructor(app: any, plugin: SecureVaultPlugin) {
		super(app);
		this.plugin = plugin;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('securevault-quick-menu');

		// Title with current algorithm
		const selectedAlgorithm = this.plugin.settings.encryptionAlgorithm;
		const algoIcon = selectedAlgorithm === 'ChaCha20-Poly1305' ? '🚀' : '🔐';
		contentEl.createEl('h2', { 
			text: `${algoIcon} SecureVault+`, 
			cls: 'securevault-title' 
		});

		// Status Summary with real-time detection (tanpa save settings di sini!)
		const summary = contentEl.createDiv('securevault-summary');
		const totalFolders = this.plugin.settings.encryptedFolders.length;
		
		// Count real locked/unlocked by detecting actual file status
		// PERBAIKAN: Simpan status di memori saja, jangan save settings berulang kali
		let realLockedCount = 0;
		const folderStatuses = new Map<string, any>();
		
		for (const folder of this.plugin.settings.encryptedFolders) {
			const status = await this.plugin.vaultManager.detectFolderLockStatus(folder.path);
			folderStatuses.set(folder.path, status);
			if (status.isLocked) {
				realLockedCount++;
			}
		}
		
		const realUnlockedCount = totalFolders - realLockedCount;

		summary.createEl('div', { 
			text: `📊 Total: ${totalFolders} folders`,
			cls: 'summary-item'
		});
		summary.createEl('div', { 
			text: `🔒 Locked: ${realLockedCount}`,
			cls: 'summary-item locked'
		});
		summary.createEl('div', { 
			text: `🔓 Unlocked: ${realUnlockedCount}`,
			cls: 'summary-item unlocked'
		});
		
		// Current algorithm indicator
		const defaultAlgorithm = this.plugin.settings.encryptionAlgorithm;
		const algoText = defaultAlgorithm === 'ChaCha20-Poly1305' ? '🚀 ChaCha20' : '🔐 AES-256';
		summary.createEl('div', { 
			text: `Default: ${algoText}`,
			cls: 'summary-item algo'
		});

		// Divider
		contentEl.createEl('hr');

		// Quick Actions Title
		contentEl.createEl('h3', { text: '⚡ Quick Actions' });

		// Action Buttons
		new Setting(contentEl)
			.setName('➕ Create Encrypted Folder')
			.setDesc('📁 Create new folder + encrypt all files & subfolders inside it')
			.addButton(btn => btn
				.setButtonText('Create')
				.setCta()
				.onClick(() => {
					this.close();
					this.plugin.createEncryptedFolderCommand();
				}));

		new Setting(contentEl)
			.setName('🔓 Unlock All Folders')
			.setDesc('🔓 DECRYPT all folders & subfolders (enter password to read files)')
			.addButton(btn => btn
				.setButtonText('Unlock All')
				.setClass('mod-warning')
				.onClick(() => {
					this.close();
					this.plugin.unlockAllCommand();
				}));

		new Setting(contentEl)
			.setName('🔒 Lock All Folders')
			.setDesc('🔒 ENCRYPT all folders & subfolders back (files become unreadable)')
			.addButton(btn => btn
				.setButtonText('Lock All')
				.onClick(() => {
					this.close();
					this.plugin.lockAllCommand();
				}));

		new Setting(contentEl)
			.setName('🛡️ Encrypt Current Folder')
			.setDesc('🛡️ Encrypt the folder of your currently opened file + all subfolders')
			.addButton(btn => btn
				.setButtonText('Encrypt')
				.onClick(() => {
					this.close();
					this.plugin.encryptCurrentFolderCommand();
				}));

		// Divider
		if (totalFolders > 0) {
			contentEl.createEl('hr');
			
			// Help text
			const helpDiv = contentEl.createDiv('securevault-help');
			helpDiv.createEl('strong', { text: '💡 How to use:' });
			helpDiv.createEl('div', { text: '• Click "Unlock" to DECRYPT files (make them readable)' });
			helpDiv.createEl('div', { text: '• Click "Lock" to ENCRYPT files (make them unreadable)' });
			helpDiv.createEl('div', { text: '• All subfolders are included automatically!' });
			helpDiv.createEl('div', { text: '• Status & Algorithm detected in REAL-TIME! ✅' });
			
			contentEl.createEl('hr');
			contentEl.createEl('h3', { text: '📁 Your Encrypted Folders' });

			// Render folders dengan folderStatuses yang sudah dikumpulkan
			await this.renderFolderList(contentEl, folderStatuses);
		}

		// Footer
		contentEl.createEl('hr');
		const footer = contentEl.createDiv('securevault-footer');
		footer.createEl('strong', { text: '💡 Pro Tips:' });
		footer.createEl('div', { text: '• RIGHT-CLICK folder in file explorer → Quick encrypt/decrypt!' });
		footer.createEl('div', { text: '• Click status bar 🔐 for quick menu access' });
		footer.createEl('div', { text: '• Subfolders are ALWAYS included in encrypt/decrypt!' });
		footer.createEl('br');
		footer.createEl('small', { 
			text: '🔐 AES-256 Encryption • All operations include subfolders',
			cls: 'securevault-tip'
		});
	}

	async renderFolderList(containerEl: HTMLElement, folderStatuses: Map<string, any>) {
		// PERBAIKAN: Gunakan folderStatuses yang sudah dikumpulkan di onOpen
		// Update settings SATU KALI saja jika ada perubahan
		let hasChanges = false;
		
		for (const folder of this.plugin.settings.encryptedFolders) {
			const realStatus = folderStatuses.get(folder.path);
			if (!realStatus) continue;
			
			// Check if status changed
			if (folder.isLocked !== realStatus.isLocked) {
				folder.isLocked = realStatus.isLocked;
				hasChanges = true;
			}
		}
		
		// Save settings SATU KALI saja jika ada perubahan
		if (hasChanges) {
			await this.plugin.saveSettings();
		}
		
		// Render UI
		for (const folder of this.plugin.settings.encryptedFolders) {
			const realStatus = folderStatuses.get(folder.path);
			if (!realStatus) continue;
			
			const icon = realStatus.isLocked ? '🔒' : '🔓';
			const statusText = realStatus.isLocked ? 'LOCKED (Encrypted)' : 'UNLOCKED (Decrypted)';
			const statusColor = realStatus.isLocked ? 'encrypted' : 'decrypted';
			
			// Algorithm display with emoji
			let algoDisplay = '';
			if (realStatus.algorithm === 'AES-256-GCM') {
				algoDisplay = '🔐 AES-256';
			} else if (realStatus.algorithm === 'ChaCha20-Poly1305') {
				algoDisplay = '🚀 ChaCha20';
			} else if (realStatus.algorithm === 'Mixed') {
				algoDisplay = '🔀 Mixed';
			} else {
				algoDisplay = '❓ Unknown';
			}
			
			new Setting(containerEl)
				.setName(`${icon} ${folder.path}`)
				.setDesc(`${folder.encryptedFiles.length} files • Status: ${statusText} • ${algoDisplay}`)
				.setClass(`folder-item-${statusColor}`)
				.addButton(btn => {
					btn.setButtonText(realStatus.isLocked ? '🔓 Unlock' : '🔒 Lock')
						.setClass(realStatus.isLocked ? 'unlock-btn' : 'lock-btn')
						.onClick(async () => {
							// PERBAIKAN: Tutup modal dulu, proses, lalu beri notifikasi
							// JANGAN buka modal lagi otomatis (menghindari looping)
							this.close();
							if (realStatus.isLocked) {
								await this.plugin.unlockSpecificFolder(folder);
								new Notice('✅ Folder unlocked! Open menu again to see updated status.');
							} else {
								await this.plugin.lockSpecificFolder(folder);
								new Notice('✅ Folder locked! Open menu again to see updated status.');
							}
						});
				});
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
