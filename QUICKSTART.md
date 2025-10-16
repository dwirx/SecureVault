# 🔐 SecureVault+ - Quick Start

Plugin enkripsi AES-256 untuk Obsidian. Aman, mudah, cross-platform dengan **UI Sidebar yang cantik**!

## ⚡ Install & Setup

1. Copy `main.js`, `manifest.json`, `styles.css` ke:
   ```
   <VaultFolder>/.obsidian/plugins/securevault-plus/
   ```

2. Restart Obsidian

3. Enable di **Settings → Community plugins**

4. **Sidebar otomatis terbuka** & folder `SecureVault` otomatis dibuat

## � UI Sidebar (Cara Paling Mudah!)

### Buka Sidebar
- **Klik icon 🛡️** di ribbon kiri
- Atau **Ctrl/Cmd + P** → ketik `Open SecureVault+ sidebar`

### Di Sidebar Kamu Bisa:

**📊 Lihat Status**
- Total folders
- Jumlah locked/unlocked
- Real-time update

**⚡ Quick Actions (Tinggal Klik!)**
- ➕ **Create Encrypted Folder** - buat folder baru
- 🔓 **Unlock All Folders** - buka semua
- 🔒 **Lock All Folders** - kunci semua
- 🛡️ **Encrypt Current Folder** - enkripsi folder aktif

**📁 Manage Folders**
- Lihat semua folder terenkripsi
- Unlock/Lock individual folder
- Lihat jumlah files per folder

## 🎯 Cara Pakai (Super Mudah!)

### 1. Enkripsi Folder
1. **Buka Sidebar** (klik icon 🛡️)
2. Klik **"🛡️ Encrypt Current Folder"**
3. Masukkan password
4. Done!

### 2. Unlock Folder
1. **Buka Sidebar**
2. Klik **"🔓 Unlock All Folders"** atau tombol "Unlock" di folder tertentu
3. Masukkan password

### 3. Lock Folder
1. **Buka Sidebar**
2. Klik **"🔒 Lock All Folders"** atau tombol "Lock" di folder tertentu
3. Masukkan password

## 📊 Status Bar
Bottom right: `🔐 2/5` = 2 folder locked dari 5 total

## ⚙️ Settings

**Settings → SecureVault+**
- Auto-lock timeout: 5 menit (default)
- Stealth mode: sembunyikan folder saat locked
- Auto backup: aktif (default)

## 🔒 Keamanan

- **AES-256 encryption**
- **PBKDF2** (10,000 iterations)
- **Client-side only** (tidak ada server)
- **No password storage** (hanya hash)

## ⚠️ PENTING

❌ **JANGAN LUPA PASSWORD!**
✅ Backup file terenkripsi rutin
✅ Test dulu dengan data tidak penting

## 🎮 Commands

| Command | Fungsi |
|---------|--------|
| `Create encrypted folder` | Buat folder baru terenkripsi |
| `Encrypt current folder` | Enkripsi folder aktif |
| `Unlock all encrypted folders` | Buka semua folder |
| `Lock all encrypted folders` | Kunci semua folder |

---

**Made with ❤️ for Obsidian**
