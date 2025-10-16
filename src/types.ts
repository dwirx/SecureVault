export interface SecureVaultSettings {
	masterPasswordHash: string;
	encryptedFolders: EncryptedFolder[];
	autoLockTimeout: number; // minutes
	showInFileExplorer: boolean; // stealth mode
	enableBiometric: boolean;
	lastUnlockTime: number;
	backupEnabled: boolean;
	backupInterval: number; // hours
}

export interface EncryptedFolder {
	path: string;
	salt: string;
	iv: string;
	isLocked: boolean;
	createdAt: number;
	lastModified: number;
	encryptedFiles: string[];
}

export interface EncryptedFileMetadata {
	algorithm: 'AES-256-GCM';
	salt: string;
	iv: string;
	content: string;
}

export const DEFAULT_SETTINGS: SecureVaultSettings = {
	masterPasswordHash: '',
	encryptedFolders: [],
	autoLockTimeout: 5,
	showInFileExplorer: false,
	enableBiometric: false,
	lastUnlockTime: 0,
	backupEnabled: true,
	backupInterval: 24
};
