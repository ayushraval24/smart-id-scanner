# 📦 Publishing Guide - Smart ID Scanner

This guide will walk you through publishing your Smart ID Scanner package to npm.

## 🚀 Quick Start

### 1. Build the Package

```bash
npm run build
```

### 2. Test the Build

```bash
# Open demo.html in your browser to test
# Or use the publish script
node publish.js
```

### 3. Publish to NPM

```bash
npm publish
```

## 📋 Pre-Publishing Checklist

Before publishing, ensure you have:

-   [ ] ✅ Built the package (`npm run build`)
-   [ ] ✅ Tested the demo locally
-   [ ] ✅ Updated version in `package.json` if needed
-   [ ] ✅ Updated repository URL in `package.json`
-   [ ] ✅ Logged in to npm (`npm login`)
-   [ ] ✅ Verified package name availability

## 🔧 Configuration Steps

### 1. Update Repository Information

Edit `package.json` and update these fields:

```json
{
    "repository": {
        "type": "git",
        "url": "https://github.com/YOUR_USERNAME/smart-id-scanner.git"
    },
    "bugs": {
        "url": "https://github.com/YOUR_USERNAME/smart-id-scanner/issues"
    },
    "homepage": "https://github.com/YOUR_USERNAME/smart-id-scanner#readme"
}
```

### 2. Update Package Name (if needed)

If you want to use a different package name:

```json
{
    "name": "your-custom-package-name"
}
```

**Note**: Package names must be unique across all npm registries.

### 3. Update Version

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

## 🔐 NPM Authentication

### 1. Create NPM Account

Visit [npmjs.com](https://www.npmjs.com) and create an account.

### 2. Login to NPM

```bash
npm login
```

You'll be prompted for:

-   Username
-   Password
-   Email
-   Two-factor authentication (if enabled)

### 3. Verify Login

```bash
npm whoami
```

## 📤 Publishing Process

### Method 1: Using the Publish Script

```bash
node publish.js
```

This script will:

-   Verify build files
-   Check npm login status
-   Show package information
-   Guide you through publishing

### Method 2: Manual Publishing

```bash
# 1. Build the package
npm run build

# 2. Check what will be published
npm pack --dry-run

# 3. Publish
npm publish
```

### Method 3: Publishing with Tags

```bash
# Publish as beta version
npm publish --tag beta

# Publish as latest (default)
npm publish --tag latest
```

## 🏷️ Version Management

### Semantic Versioning

-   **Patch** (1.0.0 → 1.0.1): Bug fixes, no breaking changes
-   **Minor** (1.0.0 → 1.1.0): New features, backward compatible
-   **Major** (1.0.0 → 2.0.0): Breaking changes

### Version Commands

```bash
# View current version
npm version

# Update version
npm version patch|minor|major

# Set specific version
npm version 1.2.3
```

## 🔍 Publishing to Custom Registry

### 1. Set Registry URL

```bash
# For a custom npm registry
npm config set registry https://your-registry.com/

# For GitHub Packages
npm config set registry https://npm.pkg.github.com/
```

### 2. Authenticate with Custom Registry

```bash
npm login --registry=https://your-registry.com/
```

### 3. Publish to Custom Registry

```bash
npm publish --registry=https://your-registry.com/
```

## 📁 Package Contents

Your published package will include:

```
smart-id-scanner/
├── dist/
│   ├── index.js          # UMD build (browsers)
│   ├── index.esm.js      # ES modules
│   ├── index.cjs.js      # CommonJS
│   ├── index.d.ts        # TypeScript definitions
│   └── *.map             # Source maps
├── README.md
└── LICENSE
```

## 🧪 Testing Before Publishing

### 1. Test Locally

```bash
# Pack without publishing
npm pack

# Install locally in another project
npm install ../path/to/smart-id-scanner-1.0.0.tgz
```

### 2. Test Demo

Open `demo.html` in your browser to verify functionality.

### 3. Test Build Output

```bash
# Verify dist folder contents
ls -la dist/

# Check file sizes
du -h dist/*
```

## 🚨 Common Issues & Solutions

### Package Name Already Taken

```bash
# Check availability
npm search smart-id-scanner

# Use scoped package name
npm init --scope=@yourusername
```

### Authentication Errors

```bash
# Re-login
npm logout
npm login

# Check token
npm token list
```

### Publishing Permission Denied

-   Ensure you're logged in with the correct account
-   Check if you have publish permissions for the package
-   Verify package ownership

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm run build

# Check for syntax errors
node -c src/index.js
```

## 📊 Post-Publishing

### 1. Verify Publication

```bash
# Check package info
npm info smart-id-scanner

# View package page
npm home smart-id-scanner
```

### 2. Update Documentation

-   Update README with installation instructions
-   Add usage examples
-   Include API documentation

### 3. Monitor Usage

```bash
# View download statistics
npm stats smart-id-scanner
```

## 🔄 Updating the Package

### 1. Make Changes

-   Update source code
-   Update version in `package.json`
-   Update CHANGELOG.md (if you have one)

### 2. Rebuild and Test

```bash
npm run build
# Test locally
```

### 3. Publish Update

```bash
npm publish
```

## 📚 Additional Resources

-   [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
-   [Package.json Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
-   [Semantic Versioning](https://semver.org/)
-   [NPM CLI Commands](https://docs.npmjs.com/cli/v8/commands)

## 🆘 Getting Help

If you encounter issues:

1. Check the [Common Issues](#-common-issues--solutions) section
2. Review npm error messages
3. Check npm documentation
4. Search npm issues on GitHub
5. Contact npm support

---

**Happy Publishing! 🎉**

Your Smart ID Scanner package is ready to help developers around the world build amazing ID scanning applications!
