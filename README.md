# jupyterlab_thredds

[![Build Status](https://travis-ci.org/eWaterCycle/jupyterlab_thredds.svg?branch=master)](https://travis-ci.org/eWaterCycle/jupyterlab_thredds)
[![SonarCloud Quality](https://sonarcloud.io/api/project_badges/measure?project=jupyterlab_thredds&metric=alert_status)](https://sonarcloud.io/dashboard?id=jupyterlab_thredds)
[![SonarCloud Coverage](https://sonarcloud.io/api/project_badges/measure?project=jupyterlab_thredds&metric=coverage)](https://sonarcloud.io/component_measures?id=jupyterlab_thredds&metric=coverage)

JupyterLab dataset browser for [THREDDS catalog](https://www.unidata.ucar.edu/software/thredds/v4.6/tds/catalog/index.html)

Can inject [iris](http://scitools.org.uk/iris/docs/latest/index.html)/[xarray](https://xarray.pydata.org)/[leaflet](https://github.com/jupyter-widgets/ipyleaflet) code cells into a Python notebook of a selected dataset to further process/visualize the dataset.

![screenshot](jupyterlab_thredds.gif "Screenshot")

## Prerequisites

* JupyterLab
* ipywidgets, `jupyter labextension install @jupyter-widgets/jupyterlab-manager`
* ipyleaflet, `jupyter labextension install jupyter-leaflet`
* [iris](http://scitools.org.uk/iris/docs/latest/index.html), `conda install -c conda-forge iris`

## Installation

Not released yet, must use development instructions to install.

```bash
pip install jupyterlab_thredds
jupyter labextension install @ewatercycle/jupyterlab_thredds
```

## Usage

1. In Jupyter lab open a notebook
2. Open the `THREDDS` tab on the left side.
3. Fill the catalog url
4. Press search button
5. Select how you would like to open the dataset, by default it uses [iris](http://scitools.org.uk/iris/docs/latest/index.html) Python package.
6. Press a dataset to insert code into a notebook

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
python setup.py develop
jupyter serverextension enable --sys-prefix jupyterlab_thredds
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

Watch mode
```bash
# shell 1
npm run watch
# shell 2
jupyter lab --ip=0.0.0.0 --no-browser --watch
```
