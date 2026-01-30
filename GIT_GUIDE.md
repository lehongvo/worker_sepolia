# Git Setup Guide

## ✅ Files Configured

### .gitignore
The following files/folders are ignored and **won't be committed**:

#### Sensitive Files
- ✅ `.env` - Environment variables (contains private keys)
- ✅ `.env.local`, `.env.*.local` - Local environment files

#### Dependencies
- ✅ `node_modules/` - NPM packages

#### Build Artifacts
- ✅ `cache/` - Hardhat cache
- ✅ `artifacts/` - Compiled contracts
- ✅ `typechain/`, `typechain-types/` - Generated types
- ✅ `coverage/` - Test coverage reports

#### Deployment Files
- ✅ `.openzeppelin/*.json` - Deployment records (except docs)

#### IDE & OS Files
- ✅ `.DS_Store`, `Thumbs.db` - OS files
- ✅ `.vscode/*` (except settings), `.idea/` - IDE files

### Files TO Commit

The following **should be committed**:

- ✅ `yarn.lock` - Lock dependencies versions
- ✅ `.env.example` - Template for environment variables
- ✅ Source code (`contracts/`, `scripts/`, `test/`)
- ✅ Configuration (`hardhat.config.js`, `package.json`)
- ✅ Documentation (`README.md`, `QUICKSTART.md`)

## 🔒 Security Check

```bash
# Verify .env is ignored
git check-ignore .env
# Should output: .env

# Check what will be committed
git status
```

## 📝 Initial Commit

```bash
# Add all files (respecting .gitignore)
git add .

# Check what will be committed
git status

# Commit
git commit -m "feat: initial Hardhat project with upgradeable ERC20 token"

# Push to remote
git push origin main
```

## ⚠️ Before First Push - Verify

```bash
# Double check .env is NOT in staging
git status | grep .env

# Should only show:
# .env.example (this is OK to commit)
# Should NOT show:
# .env (this must stay private!)
```

## 🚨 Emergency: If you accidentally committed .env

```bash
# Remove from git but keep locally
git rm --cached .env

# Commit the removal
git commit -m "fix: remove .env from tracking"

# Push
git push origin main

# Then immediately:
# 1. Rotate all secrets in .env
# 2. Generate new private key
# 3. Get new API keys
```

## 📦 What Gets Committed

```
✅ Commit:
├── .env.example           (template)
├── .gitignore            (git rules)
├── .gitattributes        (git attributes)
├── contracts/            (source code)
├── scripts/              (deploy scripts)
├── test/                 (test files)
├── hardhat.config.js     (config)
├── package.json          (dependencies)
├── yarn.lock             (lock file)
├── README.md             (docs)
├── QUICKSTART.md         (docs)
└── GIT_GUIDE.md          (this file)

❌ Never Commit:
├── .env                  (secrets!)
├── node_modules/         (too large)
├── cache/                (build artifacts)
├── artifacts/            (build artifacts)
└── .openzeppelin/*.json  (deployment records)
```

## 🔐 Security Best Practices

1. **Never** commit `.env` file
2. **Never** share private keys
3. **Always** use `.env.example` as template
4. **Always** check `git status` before committing
5. **Rotate secrets** if accidentally exposed

## 📋 Pre-commit Checklist

- [ ] Checked `git status`
- [ ] Verified `.env` is NOT in the list
- [ ] All tests pass: `yarn test`
- [ ] Code compiles: `yarn compile`
- [ ] No sensitive data in code
