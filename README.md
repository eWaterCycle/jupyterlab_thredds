# jupyterlab_thredds

[![Build Status](https://travis-ci.org/eWaterCycle/jupyterlab_thredds.svg?branch=master)](https://travis-ci.org/eWaterCycle/jupyterlab_thredds)
[![SonarCloud Quality](https://sonarcloud.io/api/project_badges/measure?project=jupyterlab_thredds&metric=alert_status)](https://sonarcloud.io/dashboard?id=jupyterlab_thredds)
[![SonarCloud Coverage](https://sonarcloud.io/api/project_badges/measure?project=jupyterlab_thredds&metric=coverage)](https://sonarcloud.io/component_measures?id=jupyterlab_thredds&metric=coverage)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1241006.svg)](https://doi.org/10.5281/zenodo.1241006)

JupyterLab dataset browser for [THREDDS catalog](https://www.unidata.ucar.edu/software/thredds/v4.6/tds/catalog/index.html)

Can inject [iris](http://scitools.org.uk/iris/docs/latest/index.html)/[xarray](https://xarray.pydata.org)/[leaflet](https://github.com/jupyter-widgets/ipyleaflet) code cells into a Python notebook of a selected dataset to further process/visualize the dataset.

![screenshot](https://github.com/eWaterCycle/jupyterlab_thredds/blob/master/jupyterlab_thredds.gif "Screenshot")

## Prerequisites

* JupyterLab, `pip install jupyterlab`
* ipywidgets, `jupyter labextension install @jupyter-widgets/jupyterlab-manager`, requirement for ipyleaflet
* ipyleaflet, `jupyter labextension install jupyter-leaflet`, to load a WMS layer
* [iris](http://scitools.org.uk/iris/docs/latest/index.html), `conda install -c conda-forge iris`

## Installation

```bash
pip install jupyterlab_thredds
jupyter labextension install @ewatercycle/jupyterlab_thredds
```

## Usage

0. Start Jupyter lab with `jupyter lab`
1. In Jupyter lab open a notebook
2. Open the `THREDDS` tab on the left side.
3. Fill the catalog url
4. Press search button
5. Select how you would like to open the dataset, by default it uses [iris](http://scitools.org.uk/iris/docs/latest/index.html) Python package.
6. Press a dataset to insert code into a notebook

## Development

For a development install, do the following in the repository directory:

```bash
pip install -r requirements.txt
jlpm
jlpm build
jupyter labextension link .
jupyter serverextension enable --sys-prefix jupyterlab_thredds
```
(`jlpm` command is JupyterLab's pinned version of [yarn](https://yarnpkg.com/) that is installed with JupyterLab.)

To rebuild the package and the JupyterLab app:

```bash
jlpm build
jupyter lab build
```

Watch mode
```bash
# shell 1
jlpm watch
# shell 2
jupyter lab --ip=0.0.0.0 --no-browser --watch
```

## Release

To make a new release perform the following steps:
1. Update version in `package.json` and `jupyterlab_thredds/version.py`
2. Record changes in `CHANGELOG.md`
3. Make sure tests pass by running `jlpm test` and `pytest`
5. Commit and push all changes
6. Publish lab extension to npmjs with `jlpm build` and `jlpm publish --access=public`
7. Publish server extension to pypi with `python setup.py sdist bdist_wheel` and `twine upload dist/*`
8. Create GitHub release
9. Update DOI in `README.md` and `CITATION.cff`
