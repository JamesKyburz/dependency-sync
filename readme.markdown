# dependency-sync

:zap: *sync your dependencies* :zap:

[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Greenkeeper badge](https://badges.greenkeeper.io/JamesKyburz/dependency-sync.svg)](https://greenkeeper.io/)

<a href="https://asciinema.org/a/174868?autoplay=1&speed=4&size=small&preload=1"><img src="https://asciinema.org/a/174868.png" width="380"/></a>

# usage

```
DEBUG=dependency-sync* dependency-sync ./assets/js ./server -t babelify
```

Babelify is only needed if you use jsx, or features node doesn't yet understand.

Use `--once` if you don't want it to watch and install while you type

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
