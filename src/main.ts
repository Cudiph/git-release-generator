#!/usr/bin/env node

import child from 'child_process';
import fs from 'fs';
import { Command } from 'commander';

// check if the directory is a git repo and no error
try {
  child.execSync('git status')
} catch (e) {
  process.exit(1);
}

let template = '';
const program = new Command();
const opts = program
  .version('1.0.0')
  .arguments('[template...]')
  .description('Use template to customize the output. Default to "{subject} ({hash})", available tags are {subject}, {hash}, {author}')
  .action((args: string[]) => { template = args.length ? args.join(' ') : '{subject} ({hash})' })
  .option('-i, --ignore <regex>', 'ignore commit message based on given regex. E.g. if you want to ignore docs typed commit you can use "^docs.*:"')
  .option('-l, --level <int>', 'Only generate specified level from latest to oldest if level is 2 then it will output the last 2 tags changes', parseInt)
  .option('-s, --slice-hash <int>', 'Number of hash character to show default to 7 characters, 40 is full length', parseInt)
  .option('-c, --no-convention', 'Remove convention type such as chore, docs, fix from the subject if you are using conventional commit')
  .option('-o, --only-hash', 'remove markdown link from hash')
  .option('-u, --unreleased', 'include untagged or unreleased commit')
  .parse(process.argv);

const tagList = child.execSync('git tag')
  .toString()
  .split('\n')
  .slice(0, -1)
  .reverse();

const remote = child.execSync('git remote -v')
  .toString()
  .match(/origin\s*(https?:\/\/git(?:hub|lab)\S+)/);

const sliceHash = opts.sliceHash || 7;
const ignore = new RegExp(opts.ignore);
let provider: string;
let limiter: number;
let file = fs.createWriteStream(`./release${tagList[0] || '0.0.0'}.md`);

if (remote && remote[1].includes('github.com'))
  provider = `${remote[1].replace(/(?:.git\/?)?$/, '')}/commit/`;
else if (remote && remote[1].includes('gitlab.com'))
  provider = `${remote[1].replace(/(?:.git\/?)?$/, '')}/-/commit/`;
else
  provider = '';


if (opts.level && opts.level < tagList.length)
  limiter = opts.level;
else
  limiter = tagList.length; // generate full history

if (opts.unreleased) {
  const tagDate = child.execSync(`git log --pretty=%cs -1`).toString();

  let gitLog: string[];
  if (tagList.length) gitLog = child.execSync(`git log --pretty=%s%n%H%n%an__SPLITTER__ ...${tagList[0]}`).toString().split(/__SPLITTER__\s*/);
  else gitLog = child.execSync(`git log --pretty=%s%n%H%n%an__SPLITTER__`).toString().split(/__SPLITTER__\s*/);
  gitLog.pop();

  file.write(`### unreleased / ${tagDate}\n`);

  for (const iter of gitLog) {
    const [subject, hash, author] = iter.split(/\n+/);

    if (!opts.ignore || !subject.match(ignore))
      file.write(`- ${
        template
          .replace(/{subject}/g, subject.match(/^\S+:/) && !opts.convention ? subject.split(/^\S+:\s*/)[1] : subject)
          .replace(/{hash}/g, !provider || opts.onlyHash ? hash.slice(0, sliceHash) : `[${hash.slice(0, sliceHash)}](${provider + hash})`)
          .replace(/{author}/g, author)
        }\n`);
  }
}


for (let i = 0; i < limiter; i++) {
  const tagDate = child.execSync(`git log --pretty=%cs ${tagList[i]} -1`).toString();

  file.write(`### ${tagList[i]} / ${tagDate}\n`); // header

  let gitLog: string[];
  if (i === limiter - 1 && i === tagList.length - 1)
    gitLog = child.execSync(`git log --pretty=%s%n%H%n%an__SPLITTER__ ${tagList[i]}`).toString().split(/__SPLITTER__\s*/);
  else
    gitLog = child.execSync(`git log --pretty=%s%n%H%n%an__SPLITTER__ ${tagList[i]}...${tagList[i + 1]}`).toString().split(/__SPLITTER__\s*/);
  gitLog.pop(); // remove array with empty string in the last element, no idea why last element is an array with empty string

  for (const iter of gitLog) {
    const [subject, hash, author] = iter.split(/\n+/);

    if (!opts.ignore || !subject.match(ignore))
      file.write(`- ${
        template
          .replace(/{subject}/g, subject.match(/^\S+:/) && !opts.convention ? subject.split(/^\S+:\s*/)[1] : subject)
          .replace(/{hash}/g, !provider || opts.onlyHash ? hash.slice(0, sliceHash) : `[${hash.slice(0, sliceHash)}](${provider + hash})`)
          .replace(/{author}/g, author)
        }\n`);
  }

  file.write('\n');

}
