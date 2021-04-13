# dependency-sync

:zap: *sync your dependencies* :zap:

[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/feross/standard)

<a href="https://asciinema.org/a/174868?autoplay=1&speed=4&size=small&preload=1"><img src="https://asciinema.org/a/174868.png" width="380"/></a>

# usage for entry point in module

```
npx dependency-sync
```

# multiple entry points

```
npx dependency-sync ./file-1.js ./file-2.js
```

# esm modules & jsx

```
npx dependency-sync -t babelify
```

babel and babelify will need to be installed and configured

example `package.json`

```json
  "devDependencies": {
    "@babel/core": "7.8.4",
    "@babel/preset-env": "7.8.4",
    "@babel/preset-react": "7.8.3",
    "babelify": "10.0.0"
  },
  "dependency-sync": {
    "args": [
      "-t",
      "babelify"
    ]
  }
```

example `babel.config.js`

```js
  module.exports = {
    presets: ['@babel/preset-env', '@babel/preset-react']
  }
```

# watch dependency changes

```
npx dependency-sync --watch
```

# check-only

will exit with error if modules are not in sync

```
npx dependency-sync --check-only
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
  "yarn": true
}

or with extra arguments

```json
"dependency-sync": {
  "yarn": 
    "args": [ ]
  }
}
```

# dry-run

```
npx dependency-sync --dry-run
```

# verbose

```
npx dependency-sync --verbose
```

# license
MIT
