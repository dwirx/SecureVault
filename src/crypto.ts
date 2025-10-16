import * as CryptoJS from 'crypto-js';
import { EncryptedFileMetadata } from './types';

export class CryptoService {
	private static readonly ALGORITHM = 'AES-256-GCM';
	private static readonly ITERATIONS = 10000;

	static generateSalt(): string {
		return CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Base64);
	}

	static generateIV(): string {
		return CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Base64);
	}

	static hashPassword(password: string, salt: string): string {
		return CryptoJS.PBKDF2(password, salt, {
			keySize: 256 / 32,
			iterations: this.ITERATIONS
		}).toString();
	}

	static encrypt(content: string, password: string): EncryptedFileMetadata {
		const salt = this.generateSalt();
		const iv = this.generateIV();
		const key = this.deriveKey(password, salt);
		
		const encrypted = CryptoJS.AES.encrypt(content, key, {
			iv: CryptoJS.enc.Base64.parse(iv),
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7
		});

		return {
			algorithm: this.ALGORITHM,
			salt: salt,
			iv: iv,
			content: encrypted.toString()
		};
	}

	static decrypt(metadata: EncryptedFileMetadata, password: string): string {
		const key = this.deriveKey(password, metadata.salt);
		
		const decrypted = CryptoJS.AES.decrypt(metadata.content, key, {
			iv: CryptoJS.enc.Base64.parse(metadata.iv),
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7
		});

		return decrypted.toString(CryptoJS.enc.Utf8);
	}

	private static deriveKey(password: string, salt: string): CryptoJS.lib.WordArray {
		return CryptoJS.PBKDF2(password, salt, {
			keySize: 256 / 32,
			iterations: this.ITERATIONS
		});
	}

	static encodeFileContent(metadata: EncryptedFileMetadata): string {
		return `---SECUREVAULT---
metadata: ${metadata.algorithm}
salt: ${metadata.salt}
iv: ${metadata.iv}
content: ${metadata.content}
---END---`;
	}

	static decodeFileContent(encodedContent: string): EncryptedFileMetadata | null {
		const match = encodedContent.match(/---SECUREVAULT---\nmetadata: (.+)\nsalt: (.+)\niv: (.+)\ncontent: (.+)\n---END---/);
		
		if (!match) return null;

		return {
			algorithm: match[1] as 'AES-256-GCM',
			salt: match[2],
			iv: match[3],
			content: match[4]
		};
	}
}
