# 🚀 Quick Release Checklist - SecureVault+

## ⚡ Fast Track Release (5 Menit)

### **Before Release:**
```bash
# 1. Update version files
vim manifest.json          # version: "1.4.0"
vim versions.json          # "1.4.0": "0.15.0"
vim CHANGELOG.md           # Add v1.4.0 section

# 2. Test build
npm run build              # Must succeed!

# 3. Commit
git add manifest.json versions.json CHANGELOG.md
git commit -m "Release v1.4.0: Anti-looping fixes"
git push origin master
```

### **Release:**
```bash
# 4. Create & push tag
git tag v1.4.0
git push origin v1.4.0

# 5. Done! GitHub Actions akan handle sisanya
```

### **Verify:**
```bash
# Check GitHub Actions:
# https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# Check Release:
# https://github.com/YOUR_USERNAME/YOUR_REPO/releases
```

---

## ✅ Pre-Release Checklist

- [ ] `manifest.json` version updated
- [ ] `versions.json` mapping added
- [ ] `CHANGELOG.md` section added
- [ ] `npm run build` succeeds
- [ ] All changes committed
- [ ] Tests passed locally
- [ ] Git status clean

---

## 🎯 Version Bump Quick Reference

| Change | Version | Example |
|--------|---------|---------|
| Bug fix | PATCH | 1.4.0 → 1.4.1 |
| New feature | MINOR | 1.4.0 → 1.5.0 |
| Breaking change | MAJOR | 1.4.0 → 2.0.0 |

---

## 🔧 Common Commands

### **Check current version:**
```bash
cat manifest.json | grep version
```

### **Create tag:**
```bash
git tag v1.4.0
git tag -a v1.4.0 -m "Release v1.4.0: Anti-looping fixes"
```

### **Delete tag (if mistake):**
```bash
git tag -d v1.4.0                    # Delete local
git push origin :refs/tags/v1.4.0   # Delete remote
```

### **List all tags:**
```bash
git tag -l
```

### **View tag details:**
```bash
git show v1.4.0
```

---

## 🎮 Manual Dispatch (UI Method)

1. Go to: `https://github.com/YOUR_REPO/actions`
2. Select: **Release Obsidian Plugin**
3. Click: **Run workflow** (top right)
4. Fill:
   - Branch: `master`
   - Version: `1.4.0`
   - Prerelease: unchecked
5. Click: **Run workflow**

---

## ⚠️ Troubleshooting One-Liners

### **Version mismatch:**
```bash
# Fix manifest & retry
vim manifest.json && git add manifest.json && git commit -m "Fix version" && git push && git tag -d v1.4.0 && git push origin :refs/tags/v1.4.0 && git tag v1.4.0 && git push origin v1.4.0
```

### **Build failed:**
```bash
# Test & fix locally first
npm install && npm run build && echo "Build OK"
```

### **Workflow not running:**
```bash
# Check tag format
git tag -l | grep 1.4.0
```

---

## 📦 Files Included in Release

✅ **manifest.json** - Plugin metadata
✅ **main.js** - Compiled plugin code
✅ **styles.css** - UI styling
✅ **securevault-plus-1.4.0.zip** - Bundle (all 3 files)

---

## 🎉 Success Indicators

After pushing tag, check:

1. **Actions Tab** - Workflow running (green checkmark)
2. **Releases Tab** - New release published
3. **Assets** - 4 files uploaded (3 individual + 1 ZIP)
4. **Release Notes** - Auto-generated from CHANGELOG

---

## 💡 Pro Tips

✅ **Always test locally before releasing**
✅ **Use consistent tag format** (always `v` prefix)
✅ **Update CHANGELOG first** (for auto-generated notes)
✅ **Double-check version numbers** (manifest matches tag)
✅ **Test with prerelease first** (for major versions)

---

## 🔗 Links

- Full Guide: `RELEASE-GUIDE.md`
- Workflow File: `.github/workflows/release.yml`
- Changelog: `CHANGELOG.md`
- GitHub Actions Docs: https://docs.github.com/actions

---

*Quick Reference for SecureVault+ v1.4.0*
*Keep this handy for fast releases! 🚀*
