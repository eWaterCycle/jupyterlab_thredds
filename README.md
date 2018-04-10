# jupyterlab_thredds

JupyterLab viewer for Thredds catalog


## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab_thredds
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

## Usage

1. In Jupyter lab open a notebook
2. Press the '>>|' (Add cell) button to add a cell to notebook which loads a iris cube from a hardcoded opendap url.
