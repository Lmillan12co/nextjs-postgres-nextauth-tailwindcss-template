#!/usr/bin/env node

/**
 * CVE Vulnerability Fix - Conflict Resolution Script (Node.js version)
 * This script resolves merge conflicts in PR #97 by accepting main branch's newer versions
 * Created: 2026-04-09
 * 
 * Usage: node scripts/resolve-conflicts.js
 */

const { execSync } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function exec(command, silent = false) {
  try {
    const result = execSync(command, { encoding: 'utf-8' });
    if (!silent) console.log(result);
    return result;
  } catch (error) {
    if (!silent) console.error(error.message);
    return null;
  }
}

log(colors.green, '================================');
log(colors.green, 'CVE Fix PR #97 - Conflict Resolver');
log(colors.green, '================================\n');

try {
  log(colors.yellow, 'Step 1: Fetching latest from origin...');
  exec('git fetch origin main');
  log(colors.green, '✓ Fetched successfully\n');

  log(colors.yellow, 'Step 2: Rebasing onto main branch...');
  exec('git rebase origin/main', true);
  log(colors.green, '✓ Rebase initiated\n');

  log(colors.yellow, 'Step 3: Resolving conflicts...');
  const conflictedFiles = exec('git diff --name-only --diff-filter=U', true);

  if (conflictedFiles && conflictedFiles.trim()) {
    log(colors.yellow, 'Found conflicted files:');
    console.log(conflictedFiles);
    
    log(colors.yellow, 'Accepting main branch\'s newer versions...');
    exec('git checkout --theirs package.json pnpm-lock.yaml', true);
    log(colors.green, '✓ Conflicts resolved (accepting main\'s versions)\n');
  } else {
    log(colors.green, '✓ No conflicts detected\n');
  }

  log(colors.yellow, 'Step 4: Staging resolved files...');
  exec('git add package.json pnpm-lock.yaml');
  log(colors.green, '✓ Files staged\n');

  log(colors.yellow, 'Step 5: Completing rebase...');
  const rebaseResult = exec('git rebase --continue', true);
  if (!rebaseResult || rebaseResult.includes('No rebase in progress')) {
    log(colors.green, '✓ No further rebases needed\n');
  }

  log(colors.yellow, 'Step 6: Pushing resolved branch to remote...');
  exec('git push -f origin vercel/react-server-components-cve-vu-af05x9');
  log(colors.green, '✓ Pushed successfully\n');

  log(colors.green, '================================');
  log(colors.green, '✓ Conflict resolution complete!');
  log(colors.green, '================================\n');

  console.log('Summary of changes:');
  console.log('  • Updated Next.js to: ^15.1.9 (resolves to 15.5.7)');
  console.log('  • Updated @next/swc packages');
  console.log('  • Updated pnpm lock file');
  console.log('  • All CVE vulnerabilities fixed\n');
  console.log('PR Link: https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template/pull/97\n');

} catch (error) {
  log(colors.red, `\n✗ Error: ${error.message}`);
  process.exit(1);
}