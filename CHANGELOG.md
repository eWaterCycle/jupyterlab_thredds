# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

## [0.5.0] - 2020-07-07

### Fixed

* Compatible with Jupyter Lab 2.1.5 ([#32](https://github.com/eWaterCycle/jupyterlab_thredds/issues/32))

## [0.4.1] - 2019-09-02

### Fixed

* Added missing fetchers sub-package

## [0.4.0] - 2019-09-02

### Added

* ESGF free text search support ([#21](https://github.com/eWaterCycle/jupyterlab_thredds/issues/21))

### Fixed

* Compatible with Jupyter Lab 1.1.0 ([#28](https://github.com/eWaterCycle/jupyterlab_thredds/issues/28))

## [0.3.0] - 2018-12-05

### Added

* timeout config key to limit the crawling time

### Fixed

* THREDDS server v5 compound serviceType not expanded (#22)
* Crawling takes too long for large (>100 datasets) catalogs (#23)

### Changed

* Retrieve WMS layers in cell instead of while crawling (#23)
* Switched from thredds_crawler to siphon Python package (#22 + #23)
* Replaced workers config key with maxtasks

## [0.2.1] - 2018-11-29

### Fixed

* Skip misbehaving wms getcapabilities urls (#20)
* Row not disabled when open as not supported for row (#19)

### Changed

* Compatible with Jupyter Lab v0.35.4
* Pinned xarray dependency so ipyleaflet is satisfied
* Show crawling in progress
* Vertical scrollbar when datasets do not fit on screen

## [0.2.0] - 2018-09-03

### Changed

* Compatible with Jupyter Lab v0.34.7

### Fixed 

* Redirection loop

## [0.1.0] - 2018-05-04

Initial release
