# 📦 Release Guide - SecureVault+

## 🎯 Cara Membuat Release Otomatis dengan GitHub Actions

Plugin SecureVault+ menggunakan **GitHub Actions** untuk automasi proses release. Workflow ini akan:
- ✅ Build plugin secara otomatis
- ✅ Validasi version matching
- ✅ Generate release notes dari CHANGELOG.md
- ✅ Upload files (manifest.json, main.js, styles.css)
- ✅ Create ZIP bundle untuk easy installation

---

## 🚀 Cara Release (2 Metode)

### **Metode 1: Git Tag (Recommended)**

#### **Step 1: Update Version**
```bash
# Update manifest.json version ke 1.4.0
# Update versions.json
# Update CHANGELOG.md
```

#### **Step 2: Commit Changes**
```bash
git add manifest.json versions.json CHANGELOG.md
git commit -m "Release v1.4.0"
git push origin master
```

#### **Step 3: Create & Push Tag**
```bash
# Buat tag (bisa dengan atau tanpa 'v' prefix)
git tag v1.4.0

# Atau tanpa 'v'
git tag 1.4.0

# Push tag ke GitHub
git push origin v1.4.0
```

#### **Step 4: Wait for Workflow**
- ✅ GitHub Actions akan trigger otomatis
- ✅ Build plugin → Validasi → Create release
- ✅ Check di: `Actions` tab di GitHub

---

### **Metode 2: Manual Dispatch (UI)**

#### **Step 1: Update Version** (sama seperti metode 1)

#### **Step 2: Go to GitHub Actions**
1. Buka repository di GitHub
2. Click tab **Actions**
3. Click **Release Obsidian Plugin** workflow
4. Click **Run workflow** button (kanan atas)

#### **Step 3: Fill Form**
- **Branch:** `master`
- **Version tag:** `1.4.0` atau `v1.4.0`
- **Mark as prerelease:** ☐ (unchecked untuk release stable)

#### **Step 4: Run & Wait**
- Click **Run workflow**
- Wait for completion (biasanya 1-2 menit)

---

## ✅ Workflow Steps (Automated)

Workflow akan menjalankan langkah-langkah berikut:

### **1. Checkout Code**
```yaml
- Checkout repository dengan full history
- Setup Node.js 18
- Cache npm dependencies
```

### **2. Build Plugin**
```bash
npm ci                    # Install dependencies
npm run build             # TypeScript + esbuild production
```

### **3. Verify Build**
```bash
- Check main.js exists
- Check manifest.json exists
- Check styles.css exists (optional)
```

### **4. Version Validation**
```bash
- Extract version from manifest.json
- Compare with tag version
- Exit with error if mismatch
```

### **5. Generate Release Notes**
```bash
- Extract CHANGELOG for this version
- Create formatted release notes
- Add installation instructions
```

### **6. Create ZIP Bundle**
```bash
- Create: securevault-plus-1.4.0.zip
- Contains: manifest.json, main.js, styles.css
```

### **7. Publish Release**
```bash
- Create GitHub Release
- Upload individual files
- Upload ZIP bundle
- Add release notes
```

---

## 📋 Pre-Release Checklist

Sebelum release, pastikan:

### ✅ **Version Numbers**
- [ ] `manifest.json` → version updated (e.g., "1.4.0")
- [ ] `versions.json` → mapping added (e.g., "1.4.0": "0.15.0")
- [ ] `package.json` → version matches (optional, not critical)

### ✅ **Documentation**
- [ ] `CHANGELOG.md` → version section added with changes
- [ ] `README.md` → updated if major features added
- [ ] Documentation files (ANTI-LOOPING-FIX.md, etc.) → complete

### ✅ **Code Quality**
- [ ] `npm run build` → success (no TypeScript errors)
- [ ] All features tested locally
- [ ] No console errors in DevTools
- [ ] Mobile compatibility checked (if applicable)

### ✅ **Git Status**
- [ ] All changes committed
- [ ] Working directory clean (`git status`)
- [ ] Pushed to `master` branch

---

## 🔧 Troubleshooting

### **Problem 1: Workflow Fails - Version Mismatch**

**Error:**
```
❌ ERROR: Version mismatch!
   manifest.json version: 1.3.0
   Release tag version:   1.4.0
```

**Solution:**
```bash
# Update manifest.json
vim manifest.json  # Change version to "1.4.0"

# Commit & push
git add manifest.json
git commit -m "Fix version mismatch"
git push origin master

# Delete old tag
git tag -d v1.4.0
git push origin :refs/tags/v1.4.0

# Create new tag
git tag v1.4.0
git push origin v1.4.0
```

---

### **Problem 2: Build Fails**

**Error:**
```
npm run build failed
TypeScript compilation errors
```

**Solution:**
```bash
# Test locally first
npm install
npm run build

# Fix errors in code
# Commit fixes
git add .
git commit -m "Fix build errors"
git push origin master

# Retry release
git push origin v1.4.0 --force
```

---

### **Problem 3: Missing Files**

**Error:**
```
main.js missing
```

**Solution:**
```bash
# Check esbuild config
cat esbuild.config.mjs

# Ensure build script works
npm run build
ls -la main.js  # Should exist

# Check .gitignore doesn't exclude build artifacts in CI
```

---

### **Problem 4: Workflow Not Triggering**

**Possible causes:**
1. Tag format wrong (use `1.4.0` or `v1.4.0`)
2. Workflow file not in `.github/workflows/`
3. GitHub Actions disabled in repo settings

**Solution:**
```bash
# Check workflow file exists
ls .github/workflows/release.yml

# Verify tag format
git tag  # List all tags

# Check GitHub repo settings
# Settings → Actions → Allow all actions
```

---

## 📊 Version Management

### **SemVer Guidelines**

```
X.Y.Z
│ │ └─── PATCH: Bug fixes, minor improvements (1.4.0 → 1.4.1)
│ └───── MINOR: New features, backward compatible (1.4.0 → 1.5.0)
└─────── MAJOR: Breaking changes (1.4.0 → 2.0.0)
```

### **Version History:**
- `1.0.0` - Initial release (basic encryption)
- `1.1.0` - Context menu + algorithm selection
- `1.2.0` - Recursive encryption fix
- `1.3.0` - Real-time detection & algorithm display
- `1.4.0` - Anti-looping system (current)

### **Next Versions:**
- `1.4.1` - Bug fixes dari user feedback
- `1.5.0` - Biometric unlock support (future)
- `2.0.0` - Native crypto API rewrite (future)

---

## 🎮 Manual Release (Without GitHub Actions)

Jika tidak menggunakan GitHub Actions:

### **Step 1: Build Locally**
```bash
npm run build
```

### **Step 2: Prepare Files**
```bash
# Copy files
cp manifest.json release/
cp main.js release/
cp styles.css release/

# Create ZIP
cd release
zip securevault-plus-1.4.0.zip manifest.json main.js styles.css
```

### **Step 3: Create GitHub Release Manually**
1. Go to `Releases` → `Draft a new release`
2. Tag: `v1.4.0`
3. Title: `🔐 SecureVault+ v1.4.0`
4. Description: Copy from CHANGELOG.md
5. Upload: `manifest.json`, `main.js`, `styles.css`, ZIP
6. Click `Publish release`

---

## 📝 Release Notes Template

When creating manual releases, use this template:

```markdown
## 🔐 SecureVault+ v1.4.0

### 🔧 CRITICAL FIX: Anti-Looping System!

**PROBLEM SOLVED: Looping ketika mengambil status & lock operations!**

✅ **Processing Flag System:**
- Added `isProcessing` flag to prevent multiple simultaneous operations
- "⏳ Please wait..." notice when trying to trigger multiple operations

✅ **Optimized Quick Menu:**
- Detection runs ONCE per modal open (was 2x before)
- Save settings ONCE per open (was per-folder before)

✅ **Debounced Status Bar:**
- Max 1 update per second (prevents excessive updates)

✅ **Performance Improvements:**
- 10+ folders: <1 second modal open (was 2-3 seconds)
- No more looping or stuck states

---

## 📦 Installation

1. Download `securevault-plus-1.4.0.zip` or individual files below
2. Extract to `<vault>/.obsidian/plugins/securevault-plus/`
3. Reload Obsidian (Ctrl+R / Cmd+R)
4. Enable plugin in Settings → Community plugins

## 📋 Required Files

- `manifest.json` - Plugin metadata
- `main.js` - Plugin code
- `styles.css` - UI styling (optional but recommended)

## 🔗 Documentation

- [User Guide](README.md)
- [Changelog](CHANGELOG.md)
- [Anti-Looping Fix Details](ANTI-LOOPING-FIX.md)

---

**Full Changelog**: https://github.com/user/repo/compare/v1.3.0...v1.4.0
```

---

## 🎯 Best Practices

### **DO:**
✅ Test locally before releasing
✅ Update CHANGELOG.md dengan detail changes
✅ Use SemVer correctly (major.minor.patch)
✅ Validate manifest.json version matches tag
✅ Include clear release notes
✅ Test installation process

### **DON'T:**
❌ Release without testing
❌ Skip CHANGELOG updates
❌ Use random version numbers
❌ Forget to push tags to GitHub
❌ Release with build errors
❌ Include development files in release

---

## 🔗 Related Documentation

- `ANTI-LOOPING-FIX.md` - Technical fixes v1.4.0
- `DETECTION-GUIDE.md` - Real-time detection system
- `ALGORITHM-GUIDE.md` - Encryption algorithm comparison
- `CHANGELOG.md` - Complete version history
- `README.md` - User guide and setup

---

## 💡 Tips

### **For First Release:**
1. Test workflow dengan prerelease first
2. Use manual dispatch untuk kontrol penuh
3. Verify all files uploaded correctly
4. Test installation di fresh vault

### **For Updates:**
1. Tag format konsisten (always use `v` prefix atau tidak sama sekali)
2. Keep CHANGELOG.md up to date
3. Announce major changes di README
4. Consider backward compatibility

### **For Hotfixes:**
1. Use PATCH version (e.g., 1.4.0 → 1.4.1)
2. Fast-track testing untuk critical bugs
3. Clear release notes tentang apa yang di-fix
4. Consider security implications

---

## 🎊 Success Indicators

Release dianggap sukses jika:

✅ **Workflow:**
- [x] GitHub Actions workflow completed
- [x] No errors in build logs
- [x] All files uploaded

✅ **Release Page:**
- [x] Release published on GitHub
- [x] Title formatted correctly
- [x] Release notes clear and complete
- [x] All required files available
- [x] ZIP bundle created

✅ **User Installation:**
- [x] Users can download files
- [x] Plugin loads without errors
- [x] All features working
- [x] No console errors

---

## 📞 Support

Jika ada masalah dengan release process:

1. **Check workflow logs:** Actions tab → View run details
2. **Read error messages:** Usually explains what went wrong
3. **Consult this guide:** Most issues covered here
4. **Check GitHub Actions docs:** https://docs.github.com/actions

---

## 🎉 Kesimpulan

GitHub Actions workflow untuk SecureVault+ sekarang:
- ✅ **Fully automated** - One command to release
- ✅ **Validated** - Version checking prevents mistakes
- ✅ **Professional** - Clean release notes & packaging
- ✅ **Reliable** - Try-catch patterns for stability

**Next Release:** Update versions → Commit → Tag → Push → Done! 🚀

---

*SecureVault+ Release System v1.4.0*
*Updated: October 17, 2025*
