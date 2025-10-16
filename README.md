# 🔐 SecureVault+ untuk Obsidian

**Enkripsi AES-256 untuk folder Obsidian dengan enkripsi rekursif sub-folder dan context menu (klik kanan)**

## ✨ Fitur Unggulan

### 🎯 Fitur Utama
- 🔒 **Enkripsi AES-256-GCM**: Military-grade encryption dengan PBKDF2 (10,000 iterasi)
- 📁 **Default Folder "SecureVault"**: Otomatis membuat folder SecureVault sebagai default
- � **Enkripsi Rekursif Sub-Folder**: Enkripsi/dekripsi SEMUA file di folder + semua sub-folder otomatis
- �️ **Context Menu (Klik Kanan)**: Klik kanan folder → Encrypt/Decrypt langsung!
- ⚡ **Quick Menu Modal**: Akses cepat via icon shield atau status bar
- � **Mobile Ready**: Fully compatible dengan iOS & Android

### 🚀 Fitur Lanjutan
- ⏰ **Auto-Lock Timer**: Otomatis lock folder setelah timeout
- 📊 **Smart Status Bar**: Klik status bar untuk quick access
- 🎨 **Responsive UI**: Touch-friendly untuk mobile
- � **Auto-Create**: Otomatis membuat folder SecureVault dengan README
- � **Multiple Folders**: Kelola banyak folder terenkripsi sekaligus
- 🎯 **Granular Control**: Enkripsi folder utama atau sub-folder saja

## 🚀 Cara Install

### Manual Installation
1. Download `main.js`, `manifest.json`, dan `styles.css`
2. Copy ke folder: `<VaultFolder>/.obsidian/plugins/securevault-plus/`
3. Restart Obsidian
4. Enable plugin di **Settings → Community plugins**

## 📖 Cara Menggunakan

### ⚡ METHOD 1: Context Menu (TERCEPAT!)

**Encrypt Folder + Sub-Folder:**
1. **Klik KANAN** folder di File Explorer
2. Pilih **"🔒 Encrypt folder"**
3. Masukkan password (min 6 karakter)
4. ✅ Done! Semua file di folder + sub-folder terenkripsi

**Decrypt Folder + Sub-Folder:**
1. **Klik KANAN** folder terenkripsi
2. Pilih **"🔓 Decrypt folder"**
3. Masukkan password
4. ✅ Done! Semua file terdekripsi

### 🎯 METHOD 2: Quick Menu Modal

**Akses menu dengan 3 cara:**
- 🛡️ Klik **icon shield** di ribbon kiri
- 🔐 Klik **status bar** (🔐 X locked) di bawah
- ⌨️ **Ctrl+P** → "Open SecureVault+ menu"

**Menu tersedia:**
- ➕ Create Encrypted Folder (default: SecureVault)
- 🔓 Unlock All Folders
- 🔒 Lock All Folders
- 🛡️ Encrypt Current Folder
- � Daftar folder dengan tombol unlock/lock per folder

### 💻 METHOD 3: Command Palette

**Ctrl+P** atau **Cmd+P**, ketik:
- "Create encrypted folder" - Buat folder baru (default: SecureVault)
- "Encrypt current folder" - Enkripsi folder dari file aktif
- "Unlock all encrypted folders" - Unlock semua folder
- "Lock all encrypted folders" - Lock semua folder

### 📁 Struktur Folder Recommended

```
SecureVault/                 ← Default folder (auto-created)
├── Personal/               ← Sub-folder
│   ├── Diary.md
│   └── Secrets.md
├── Work/                   ← Sub-folder
│   ├── Project1.md
│   └── Project2.md
└── Projects/               ← Sub-folder
    └── Private.md
```

**Enkripsi folder utama** = Semua sub-folder ikut terenkripsi!
**Enkripsi sub-folder** = Hanya sub-folder itu saja

## ⚙️ Settings

**Settings → SecureVault+**

- **Auto-lock timeout**: Waktu tunggu sebelum auto-lock (menit)
- **Stealth mode**: Sembunyikan folder terenkripsi saat locked
- **Enable biometric**: Gunakan fingerprint/Face ID di mobile
- **Auto backup**: Aktifkan backup otomatis
- **Backup interval**: Interval backup (jam)

## 🔒 Keamanan

### Format Enkripsi
```
---SECUREVAULT---
metadata: AES-256-GCM
salt: <random base64>
iv: <random base64>
content: <encrypted data>
---END---
```

### Keamanan Teknis
- **AES-256 encryption**: Standar enkripsi militer
- **PBKDF2 key derivation**: 10,000 iterations
- **Random salt & IV**: Setiap file unik
- **Client-side only**: Tidak ada data dikirim ke server
- **No password storage**: Password tidak disimpan, hanya hash

## 🎨 UI Commands

- `SecureVault: Create encrypted folder`
- `SecureVault: Unlock all encrypted folders`
- `SecureVault: Lock all encrypted folders`
- `SecureVault: Encrypt current folder`

## 🛠️ Development

```bash
npm install     # Install dependencies
npm run dev     # Development mode (watch)
npm run build   # Build production
```

## 📝 Roadmap

- [ ] Multi-password access (berbeda password untuk folder berbeda)
- [ ] Access log (timestamp akses)
- [ ] Attachment encryption (gambar, PDF)
- [ ] Restore backup functionality
- [ ] Mobile biometric integration
- [ ] Encrypted search
- [ ] Folder sharing

## ⚠️ Disclaimer

**PENTING**: 
- Jangan lupa password! Tidak ada recovery
- Backup file terenkripsi secara teratur
- Test dulu dengan data tidak penting

## 📄 License

MIT License

---

**⭐ Made with ❤️ for Obsidian Community**
