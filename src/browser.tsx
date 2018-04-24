import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Widget } from '@phosphor/widgets';
import {
    ServerConnection
} from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { ThreddsDataset, IDataset } from './listing';
import { INotebookTracker, INotebookModel } from '@jupyterlab/notebook';
import { CodeCellModel } from '@jupyterlab/cells';

export class ThreddsFileBrowser extends Widget {
    tracker: INotebookTracker;
    constructor(tracker: INotebookTracker) {
        super();
        this.title.label = 'THREDDS';
        this.id = 'thredds-file-browser';
        this.addClass('jp-ThreddsBrowser');
        this.tracker = tracker;
        this.update();
    }

    onUpdateRequest() {
        ReactDOM.unmountComponentAtNode(this.node);
        ReactDOM.render(<ThreddsCatalogBrowser open={this.onOpen} />, this.node);
    }

    codeCell(code: string) {
        return new CodeCellModel({
            cell: {
                cell_type: 'code',
                source: [code],
                metadata: { trusted: false, collapsed: false }
            }
        })
    }

    urlOfService(dataset: IDataset, service: string) {
        return dataset.services.filter(s => s.service === service)[0].url;
    }

    irisCode(dataset: IDataset) {
        const dap_url = this.urlOfService(dataset, 'OPENDAP');
        return 'cube = iris.load_cube("' + dap_url + '")';
    }

    xarrayCode(dataset: IDataset) {
        const dap_url = this.urlOfService(dataset, 'OPENDAP');
        return 'ds = xr.open_dataset("' + dap_url + '")';
    }

    leafletCode(dataset: IDataset) {
        const wms_url = this.urlOfService(dataset, 'WMS');
        return 'wms = ipyleaflet.WMSLayer(url="' + wms_url + '", layers="<Change to layer name(s) to render>")';
    }

    currentNotebook(): INotebookModel {
        return this.tracker.currentWidget.model;
    }

    onOpen = (dataset: IDataset, openas: string) => {
        if (openas === 'iris') {
            this.currentNotebook().cells.push(this.codeCell(this.irisCode(dataset)));
        } else if (openas === 'xarray') {
            this.currentNotebook().cells.push(this.codeCell(this.xarrayCode(dataset)));
        } else if (openas === 'leaflet') {
            this.currentNotebook().cells.push(this.codeCell(this.leafletCode(dataset)));
        } else if (openas === 'file') {
            window.open(this.urlOfService(dataset, 'HTTPServer'));
        }
    }
}

export interface IProps {
    open(dataset: IDataset, openas: string): void;
}

export interface IState {
    catalog_url: string;
    openas: string;
    datasets: IDataset[];
}

export class ThreddsCatalogBrowser extends React.Component<IProps, IState> {
    _serverSettings: ServerConnection.ISettings;

    constructor(props: IProps) {
        super(props);
        this._serverSettings = ServerConnection.makeSettings();
        this.state = {
            catalog_url: 'http://localhost:8080/thredds/catalog.xml',
            openas: 'iris',
            datasets: []
        };
    }

    handleSubmit = (event: any) => {
        this.fetchDatasets(this.state.catalog_url);
        event.preventDefault();
    }

    fetchDatasets(catalog_url: string) {
        const query = { catalog_url: this.state.catalog_url };
        const url = URLExt.join(this._serverSettings.baseUrl, 'thredds', URLExt.objectToQueryString(query));
        ServerConnection.makeRequest(url, {}, this._serverSettings).then(response => {
            if (response.status !== 200) {
                return response.json().then(data => {
                    throw new ServerConnection.ResponseError(response, data.message);
                });
            }
            return response.json();
        }).then(datasets => {
            this.setState({ datasets });
        });
    }

    onCatalogUrlChange = (event: any) => {
        this.setState({ catalog_url: event.target.value });
    }

    onOpenAsChange = (event: any) => {
        this.setState({ openas: event.target.value });
    }

    onDatasetClick = (dataset: IDataset) => {
        this.props.open(dataset, this.state.openas);
    }

    render() {
        const items = this.state.datasets.map((d) => (
            <ThreddsDataset key={d.id} dataset={d} onClick={this.onDatasetClick} />
        ));
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Catalog URL
                        <input type="text" value={this.state.catalog_url} onChange={this.onCatalogUrlChange} />
                    </label>
                    <label>
                        Open as
                        <select value={this.state.openas} onChange={this.onOpenAsChange}>
                            <option value="iris">Iris data cube</option>
                            <option value="xarray">Xarray dataset</option>
                            <option value="leaflet">Leaflet WMS layer</option>
                            <option value="file">File</option>
                        </select>
                    </label>
                    <input type="submit" value="Search" />
                </form>
                <ul>
                    {items}
                </ul>
            </div>
        );
    }
}