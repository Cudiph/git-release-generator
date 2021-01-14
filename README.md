# git-release-generator

A simple and flexible cli to help you generate release notes

## Features

- Customizable
- Light and fast
- Easy to use

## Installing

Install globally with:
```bash
$ npm install -g git-release-generator
```

## Example usage

To generate a notes, you must in a local git repo. Then simply run this:
```bash
$ gitregen 
```
It'll use default option to generate the notes. The default output is similar to
[denoland/deno](https://github.com/denoland/deno/releases) releases.

You can customize the output with specifying the template, for example I'm gonna use
[nodejs/node](https://github.com/nodejs/node/releases) releases. The usage should look like this:
```bash
$ gitregen -uo -s 10 "[{hash}] - {subject} ({author})"
```

And will generate md file with this content:
```markdown
### unreleased / 2021-01-14

- [42aedc5b17] - fix: allow generate for repo that doesn't have any tag (Cudiph)
- [b7a12f1176] - Initial commit (Cudiph)
```

## Option Explained

For reference i will use my [node-gtrans](https://github.com/Cudiph/node-gtrans/commits/v1.4.0)
repo at v1.4.0 to v1.3.2

With using default options then the output look like this:
```markdown
### v1.4.0 / 2021-01-02

- 1.4.0 ([8895905](linkToCommit)
- chore: update example.js ([213477d](linkToCommit)
- fix: let user handling the error themselves ([912cd21](linkToCommit)

### v1.3.2 / 2021-01-01

- 1.3.2 ([0d5be5f](linkToCommit)
- Merge branch 'master' of https://github.com/Cudiph/node-gtrans ([a90a303](linkToCommit)
- docs(readme): Fix typo ([a11e484](linkToCommit)
```

* `-i, --ignore` - Accept regex as an argument, will skip a commit if the commit subject match the regex pattern.  
  With `$ gitregen -i "\d\.\d\.\d"`:
  ```markdown
  ### v1.4.0 / 2021-01-02

  - chore: update example.js ([213477d](linkToCommit)
  - fix: let user handling the error themselves ([912cd21](linkToCommit)

  ### v1.3.2 / 2021-01-01

  - Merge branch 'master' of https://github.com/Cudiph/node-gtrans ([a90a303](linkToCommit)
  - docs(readme): Fix typo ([a11e484](linkToCommit)
  ```


* `-l, --level` - Only generate specified tag release from newest to oldest tag.  
  With `$ gitregen -l 1`:
  ```markdown
  ### v1.4.0 / 2021-01-02

  - 1.4.0 ([8895905](linkToCommit)
  - chore: update example.js ([213477d](linkToCommit)
  - fix: let user handling the error themselves ([912cd21](linkToCommit)
  ```

* `-s, --slice-hash` - Number of hash digit to be shown  
  With `$ gitregen -s 10`:
  ```markdown
  - chore: update example.js ([213477d540](linkToCommit)
  ```

* `-c, --no-convention` - Remove convention type in commit message, if the subject is "docs(readme): update README.md" then the output will be "update README.md"  
  With `$ gitregen -c`:
  ```markdown
  - update example.js ([213477d](linkToCommit)
  ```

* `-o, --only-hash` - Remove hash linking if you're using github or gitlab in origin remote.  
  With `$ gitregen -o`:
  ```markdown
  - chore: update example.js (213477d)
  ```

* `-u, --unreleased` - Newest commits that has not been tagged will be included. Example is at [Example Usage](#example-usage).

## See also

* https://medium.com/better-programming/create-your-own-changelog-generator-with-git-aefda291ea93
* https://github.com/axetroy/vscode-changelog-generator
