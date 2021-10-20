#!/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

copyRecursiveSync = (src, dest, exclude = []) => {
  if (exclude.indexOf(path.resolve(src)) !== -1) {
    return;
  }
  const stats = fs.existsSync(src) ? fs.statSync(src) : false;
  const isDirectory = !!stats && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), exclude);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

const main = async () => {
  fs.rmdirSync(path.resolve('./deployment'), { recursive: true });
  fs.rmdirSync(path.resolve('./tmp.deployment'), { recursive: true });
  fs.mkdirSync(path.resolve('./deployment'));
  fs.writeFileSync(path.resolve('./deployment/.gitkeep'), '');

  const packageJson = JSON.parse(fs.readFileSync(path.resolve('./package.json')).toString());

  fs.mkdirSync(path.resolve('./tmp.deployment'));
  execSync(`git clone git@github.com:sotaoi/auth . && git checkout -b ${packageJson.version}`, {
    cwd: path.resolve('./tmp.deployment'),
    stdio: 'inherit',
  });

  copyRecursiveSync(path.resolve('./'), path.resolve('./deployment'), [
    path.resolve('.git'),
    path.resolve('./deployment'),
    path.resolve('./certs'),
    path.resolve('./node_modules'),
    path.resolve('./tmp.deployment'),
  ]);

  execSync('npm run bootstrap:prod', { cwd: path.resolve('./deployment'), stdio: 'inherit' });

  fs.renameSync(path.resolve('./tmp.deployment/.git'), path.resolve('./deployment/.git'));
  fs.rmdirSync(path.resolve('./tmp.deployment'), { recursive: true });
  execSync(
    `git add --all && git commit m "release ${packageJson.version}" && git push f u origin ${packageJson.version}`,
    {
      cwd: path.resolve('./deployment'),
      stdio: 'inherit',
    },
  );
  fs.rmdirSync(path.resolve('./deployment/.git'), { recursive: true });
  +execSync('git add --all', { stdio: 'inherit' });
  +execSync(`git commit -m "deploy: >> ${packageJson.version} <<"`, { stdio: 'inherit' });
  +execSync('git push', { stdio: 'inherit' });
};

main();
