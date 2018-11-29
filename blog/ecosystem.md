Software that is related or can be used by this software or is similar to this software.

The [THREDDS catalog format](https://www.unidata.ucar.edu/software/thredds/v4.6/tds/catalog/index.html) is supported by the [THREDDS servers](https://www.unidata.ucar.edu/software/thredds/current/tds/) and the [Hyrax OPeNDAP server](https://www.opendap.org/software/hyrax-data-server).

A Earth System Grid Federation (ESGF) is a system that hosts model output and observational data like [CMIP6](https://www.wcrp-climate.org/wgcm-cmip/wgcm-cmip6).
A ESGF data node uses a THREDDS server to host the data.

Several libraries allow you to interact with a THREDDS catalog
* [thredds_crawler](https://github.com/ioos/thredds_crawler), parallel fetching
* [threddsclient](https://github.com/bird-house/threddsclient)
* [siphon](https://unidata.github.io/siphon/latest/), made by unidata, who also develop THREDDS server

For QGIS there is the [THREDDSExplorer](https://github.com/IHCantabria/THREDDSExplorer) which allows you to select a dataset on a THREDDS server and to visualize it using WMS or WCS protocol.

Version 5 of the THREDDS server has on the dataset information page a Jupyter notebook available for download. 
This Jupyter extension does the opposite, it allow you to browse the THREDDS server from inside a Jupyter environmnent and add a code cell in a notebook to open the dataset.
