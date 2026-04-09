# CVE Vulnerability Fix - PR #97 Conflict Resolution Guide

## 📋 Overview

This guide helps resolve merge conflicts in PR #97 which updates Next.js and React dependencies to fix CVE vulnerabilities.

**PR Link**: https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template/pull/97

## 🚀 Quick Start - Automated Scripts

### Option 1: Bash Script (Unix/Linux/macOS)
```bash
chmod +x scripts/resolve-conflicts.sh
./scripts/resolve-conflicts.sh
```

### Option 2: Node.js Script (Cross-platform)
```bash
node scripts/resolve-conflicts.js
```

## 📊 Version Comparison

| Package | PR Version | Main Version | Final Version | Status |
|---------|-----------|--------------|---------------| -------|
| next | 15.1.11 | ^15.1.9 | 15.5.7 | ✅ Newer |
| @next/swc-darwin-arm64 | 15.1.9 | 15.5.7 | 15.5.7 | ✅ Updated |
| @next/swc-darwin-x64 | 15.1.9 | 15.5.7 | 15.5.7 | ✅ Updated |
| @next/swc-linux-arm64-gnu | 15.1.9 | 15.5.7 | 15.5.7 | ✅ Updated |
| @next/swc-linux-arm64-musl | 15.1.9 | 15.5.7 | 15.5.7 | ✅ Updated |
| @next/swc-linux-x64-gnu | 15.1.9 | 15.5.7 | 15.5.7 | ✅ Updated |
| @next/swc-linux-x64-musl | 15.1.9 | 15.5.7 | 15.5.7 | ✅ Updated |
| @next/swc-win32-arm64-msvc | 15.1.9 | 15.5.7 | 15.5.7 | ✅ Updated |
| @next/swc-win32-x64-msvc | 15.1.9 | 15.5.7 | 15.5.7 | ✅ Updated |

## ✅ Why Accept Main's Versions?

1. **Newer Release**: 15.5.7 is more recent than 15.1.11
2. **More Stable**: Main branch contains bleeding-edge but stable versions
3. **CVE Fixed**: All React Server Components vulnerabilities are patched
4. **Lock File Synced**: Dependencies properly resolved
5. **Better Testing**: Main branch is actively maintained and tested

## 🔧 Manual Resolution Steps

If the automated scripts don't work, follow these manual steps:

### Step 1: Fetch and Rebase
```bash
git fetch origin main
git rebase origin/main
```

### Step 2: Accept Main's Versions
When prompted for conflicts:
```bash
# Accept main's versions for both files
git checkout --theirs package.json pnpm-lock.yaml

# Or accept each file individually
git checkout --theirs package.json
git checkout --theirs pnpm-lock.yaml
```

### Step 3: Complete Rebase
```bash
git add package.json pnpm-lock.yaml
git rebase --continue
```

### Step 4: Push Changes
```bash
git push -f origin vercel/react-server-components-cve-vu-af05x9
```

## 📝 What Gets Fixed

### package.json Changes
```json
{
  "dependencies": {
    "next": "^15.1.9"  // Was: 15.1.11
  }
}
```

### Lock File Updates
The `pnpm-lock.yaml` is automatically updated to reflect:
- Updated Next.js version (15.5.7)
- Updated all @next/swc platform-specific packages
- Updated @vercel/analytics compatibility
- Updated next-auth compatibility

## 🐛 Troubleshooting

### Issue: Script permission denied
```bash
chmod +x scripts/resolve-conflicts.sh
./scripts/resolve-conflicts.sh
```

### Issue: Git not found
Use Node.js version instead:
```bash
node scripts/resolve-conflicts.js
```

### Issue: Still have conflicts?
```bash
# Reset and try manual resolution
git rebase --abort
git fetch origin main
# Then follow manual steps above
```

### Issue: Force push fails
```bash
# Make sure you have write access to the fork
git push --force-with-lease origin vercel/react-server-components-cve-vu-af05x9
```

## 📚 Related Information

- **PR**: Fix React Server Components CVE vulnerabilities
- **Created**: February 5, 2026
- **Branch**: `vercel/react-server-components-cve-vu-af05x9`
- **Base**: `main` (Vercel's nextjs-postgres-nextauth-tailwindcss-template)

## 🔐 Security Notes

This PR addresses critical CVE vulnerabilities in:
- Next.js 15.1.3 (React Server Components)
- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

Main branch's version (15.5.7) includes all necessary security patches.

## 📞 Support

If you encounter issues:
1. Run the automated script
2. Follow manual steps if needed
3. Check GitHub PR for additional context
4. Verify your git config is correct

---

**Last Updated**: April 9, 2026
**Status**: Conflict Resolution Guide