# dependency-sync

:zap: *sync your dependencies* :zap:

[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Greenkeeper badge](https://badges.greenkeeper.io/JamesKyburz/dependency-sync.svg)](https://greenkeeper.io/)

<a href="https://asciinema.org/a/174868?autoplay=1&speed=4&size=small&preload=1"><img src="https://asciinema.org/a/174868.png" width="380"/></a>

# usage for entry point in module

```
npx dependency-sync
```

# multiple entry points

```
npx dependency-sync ./file-1.js ./file-2.js
```

# esm modules

```
npx dependency-sync -t babelify
```

babel and babelify will need to be installed and configured for esm.

# watch files and sync dependencies

```
npx dependency-sync --watch
```

# keep

`dependency-sync` ignores devDependencies, However dependencies that aren't explicitly required will be removed.

To prevent this add the following directive to your package.json.

```json
"dependency-sync": {
  "keep": [
    "babelify"
  ]
}
```

# yarn

To use `dependency-sync` with yarn use add the following directive to your package.json.

args is passed to [yarn add](https://yarnpkg.com/en/docs/cli/add)

```json
"dependency-sync": {
  "yarn": {
    "args": [ ]
  }
}
```

# license
MIT
