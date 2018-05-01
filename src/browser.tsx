import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Widget } from '@phosphor/widgets';
import {
    ServerConnection
} from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { ThreddsDataset, IDataset, IService } from './listing';
import { INotebookTracker, INotebookModel, NotebookActions } from '@jupyterlab/notebook';
import { CodeCellModel, ICellModel } from '@jupyterlab/cells';
import { showErrorMessage } from '@jupyterlab/apputils';
import { IObservableUndoableList } from '@jupyterlab/observables';
import { find } from '@phosphor/algorithm';


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
                metadata: { trusted: false, collapsed: false, tags: ['injected by THREDDS browser'] }
            }
        })
    }

    serviceByType(dataset: IDataset, service: string): IService {
        return dataset.services.filter(s => s.service === service)[0];
    }

    urlOfService(dataset: IDataset, service: string) {
        return this.serviceByType(dataset, service).url;
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
        const service = this.serviceByType(dataset, 'WMS');
        if (service.layers.length === 1) {
            return 'wms = ipyleaflet.WMSLayer(url="' + service.url + '", layers="' + service.layers[0] + '")';
        } else {
            return 'wms = ipyleaflet.WMSLayer(url="' + service.url + '", layers=' + JSON.stringify(service.layers) + '[0])';
        }
    }

    currentNotebook(): INotebookModel {
        return this.tracker.currentWidget.model;
    }

    notbookHasImport(cells: IObservableUndoableList<ICellModel>, importCode: string, offset = 0) {
        const result = find(cells.iter(), (c, i) => i <= offset && c.type === 'code' && c.value.text.indexOf(importCode) !== -1);
        return result !== undefined;
    }

    onOpen = (dataset: IDataset, openas: string) => {
        if (openas === 'file') {
            window.open(this.urlOfService(dataset, 'HTTPServer'));
            return;
        }
        if (!this.tracker.currentWidget) {
            showErrorMessage('Unable to inject cell without an active notebook', {});
            return;
        }
        const nb = this.currentNotebook();
        if (nb.defaultKernelLanguage !== 'python') {
            showErrorMessage('Active notebook uses wrong kernel language. Only python is supported', {});
            return;
        }
        if (nb.readOnly) {
            showErrorMessage('Unable to inject cell into read-only notebook', {});
            return;
        }
        let code = '';
        const activeCellIndex = this.tracker.currentWidget.notebook.activeCellIndex;
        if (openas === 'iris') {
            if (!this.notbookHasImport(nb.cells, 'import iris', activeCellIndex)) {
                code += 'import iris\n';
            }
            code += this.irisCode(dataset);
        } else if (openas === 'xarray') {
            if (!this.notbookHasImport(nb.cells, 'import xarray as xr', activeCellIndex)) {
                code += 'import xarray as xr\n';
            }
            code += this.xarrayCode(dataset);
        } else if (openas === 'leaflet') {
            if (!this.notbookHasImport(nb.cells, 'import ipyleaflet', activeCellIndex)) {
                code += 'import ipyleaflet\n';
            }
            code += this.leafletCode(dataset);
        }
        const cell = this.codeCell(code);
        let cellIndex = nb.cells.length;
        if (this.tracker.activeCell) {
            cellIndex = activeCellIndex + 1;
        }
        nb.cells.insert(cellIndex, cell);
        NotebookActions.selectBelow(this.tracker.currentWidget.notebook);
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
                <form className="p-Widget" onSubmit={this.handleSubmit}>
                    <div className="p-Widget">
                        <label>Catalog URL</label>
                        <div className="jp-TreddsBrowser-wrapper">
                            <input className="jp-mod-styled jp-TreddsBrowser-input" type="text" value={this.state.catalog_url} onChange={this.onCatalogUrlChange} />
                        </div>
                    </div>
                    <div className="p-Widget">
                        <label>
                            Open as
                        </label>
                        <div className="jp-select-wrapper">
                            <select className="jp-mod-styled" value={this.state.openas} onChange={this.onOpenAsChange}>
                                <option value="iris">Iris data cube</option>
                                <option value="xarray">Xarray dataset</option>
                                <option value="leaflet">Leaflet WMS layer</option>
                                <option value="file">File</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-Widget jp-TreddsBrowser-wrapper">
                        <input className="jp-mod-styled jp-TreddsBrowser-input" type="submit" value="Search" />
                    </div>
                </form>
                <hr />
                <div className="p-Widget jp-DirListing">
                    <ul className="jp-DirListing-content">
                        {items}
                    </ul>
                </div>
            </div>
        );
    }
}