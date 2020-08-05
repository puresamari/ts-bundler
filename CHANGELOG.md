# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.0.7 - 5. August 2020
### Changed
- Added new resolve mechanism so that external applications can run this without node.require.resolve

## 0.0.5 - 4. August 2020
### Fixed
- More dynamic module path reading

## 0.0.4 - 31. July 2020
### Fixed
- return value of collected module that aren't node_modules

## 0.0.3 - 31. July 2020
### Fixed
- module resolution for external node_modules

## 0.0.2 - 31. July 2020
### Added
- node_module module resoltion

### Changed
- split into seperate moduleResolution and file building

## 0.0.1 - 30. July 2020
Initial version