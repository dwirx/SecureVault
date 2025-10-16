export type EncryptionAlgorithm = 'AES-256-GCM' | 'ChaCha20-Poly1305';

export interface AccessLogEntry {
	timestamp: number;
	action: 'unlock' | 'lock' | 'create' | 'access';
	folderPath: string;
	success: boolean;
	details?: string;
}

export interface SecureVaultSettings {
	masterPasswordHash: string;
	encryptedFolders: EncryptedFolder[];
	autoLockTimeout: number; // minutes
	showInFileExplorer: boolean; // stealth mode
	enableBiometric: boolean;
	lastUnlockTime: number;
	backupEnabled: boolean;
	backupInterval: number; // hours
	encryptionAlgorithm: EncryptionAlgorithm;
	// NEW FEATURES
	enableAccessLog: boolean;
	accessLogs: AccessLogEntry[];
	maxAccessLogs: number;
	enableKeyFile: boolean;
	keyFilePath: string;
	passwordMinLength: number;
	requireStrongPassword: boolean;
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
	algorithm: EncryptionAlgorithm;
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
	backupInterval: 24,
	encryptionAlgorithm: 'AES-256-GCM',
	// NEW FEATURES DEFAULTS
	enableAccessLog: true,
	accessLogs: [],
	maxAccessLogs: 100,
	enableKeyFile: false,
	keyFilePath: '',
	passwordMinLength: 8,
	requireStrongPassword: true
};
