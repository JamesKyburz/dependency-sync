# dependency-sync

:zap: *sync your dependencies* :zap:

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# usage

```
DEBUG=dependency-sync* dependency-sync ./assets/js ./server -t babelify
```

Babelify is only needed if you use jsx, or features node doesn't yet understand.

Use `--once` if you don't want it to watch and install while you type

# keep

`dependency-sync` ignores devDependencies, However dependencies that aren't explicitly required will be removed.

To prevent his add the following directive to your package.json.

```json
"dependency-sync": {
  "keep": [
    "babelify"
  ]
}
```

# license
MIT
