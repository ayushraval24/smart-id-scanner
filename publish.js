#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Smart ID Scanner - NPM Package Publisher\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run this script from the project root.');
    process.exit(1);
}

// Check if dist folder exists
if (!fs.existsSync('dist')) {
    console.error('❌ Error: dist folder not found. Please run "npm run build" first.');
    process.exit(1);
}

// Check if dist contains the required files
const requiredFiles = ['index.js', 'index.esm.js', 'index.cjs.js', 'index.d.ts'];
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join('dist', file)));

if (missingFiles.length > 0) {
    console.error(`❌ Error: Missing required files in dist folder: ${missingFiles.join(', ')}`);
    console.error('Please run "npm run build" first.');
    process.exit(1);
}

console.log('✅ Build files verified successfully!\n');

// Check npm login status
try {
    console.log('🔐 Checking npm login status...');
    execSync('npm whoami', { stdio: 'pipe' });
    console.log('✅ Logged in to npm\n');
} catch (error) {
    console.log('❌ Not logged in to npm. Please run "npm login" first.\n');
    process.exit(1);
}

// Show package info
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('📦 Package Information:');
console.log(`   Name: ${packageJson.name}`);
console.log(`   Version: ${packageJson.version}`);
console.log(`   Description: ${packageJson.description}`);
console.log(`   Author: ${packageJson.author}`);
console.log(`   License: ${packageJson.license}\n`);

// Show files that will be published
console.log('📁 Files to be published:');
const filesToPublish = ['dist/', 'README.md', 'LICENSE'];

filesToPublish.forEach((file) => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        if (stats.isDirectory()) {
            const fileCount = fs.readdirSync(file).length;
            console.log(`   ${file} (${fileCount} files)`);
        } else {
            console.log(`   ${file}`);
        }
    }
});

console.log('\n📋 Publishing steps:');
console.log('1. ✅ Build verification completed');
console.log('2. ✅ NPM login verified');
console.log('3. 🔄 Ready to publish\n');

// Ask for confirmation
console.log('⚠️  IMPORTANT: Make sure you have:');
console.log('   - Updated the version in package.json if needed');
console.log('   - Updated the repository URL in package.json');
console.log('   - Tested the package locally\n');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Do you want to proceed with publishing? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🚀 Publishing package...\n');

        try {
            // Run npm publish
            execSync('npm publish', { stdio: 'inherit' });
            console.log('\n✅ Package published successfully!');
            console.log(`\n📦 Your package is now available at: https://www.npmjs.com/package/${packageJson.name}`);
        } catch (error) {
            console.error('\n❌ Error publishing package:', error.message);
            console.log('\n💡 Common solutions:');
            console.log('   - Check if the package name is available');
            console.log('   - Ensure you have publish permissions');
            console.log('   - Verify your npm login status');
        }
    } else {
        console.log('\n❌ Publishing cancelled.');
    }

    rl.close();
});
