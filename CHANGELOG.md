# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.0.6 - 26. July 2020
### Added
- Import tree detection for twig files

### Changed
- Compilers are now running as an instance

## 0.0.5 - 26. July 2020
### Added
- `.js` and `.ts` extensions are now automatically resolved in `typescript` and `javascript` files
- Postcss plugins can be customized with the config files `compilers.postcss.plugins`
```
"compilers": {
  "postcss": {
    "plugins": [
      ...
      "precss", // or other
      ...
    ]
  }
}
```