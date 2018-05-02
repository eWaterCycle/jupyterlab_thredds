import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Widget } from '@phosphor/widgets';
import {
    ServerConnection
} from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { showErrorMessage } from '@jupyterlab/apputils';

import { ThreddsDataset, IDataset } from './listing';
import { Injector } from './injector';


export class ThreddsFileBrowser extends Widget {
    injector: Injector;
    tracker: INotebookTracker;
    constructor(tracker: INotebookTracker) {
        super();
        this.title.label = 'THREDDS';
        this.id = 'thredds-file-browser';
        this.addClass('jp-ThreddsBrowser');
        this.tracker = tracker;
        this.injector = new Injector();
        this.update();
    }

    onUpdateRequest() {
        ReactDOM.unmountComponentAtNode(this.node);
        ReactDOM.render(<ThreddsCatalogBrowser open={this.onOpen} />, this.node);
    }

    onOpen = (dataset: IDataset, openas: string) => {
        if (!this.tracker.currentWidget) {
            showErrorMessage('Unable to inject cell without an active notebook', {});
            return;
        }
        const notebook = this.tracker.currentWidget.notebook;
        this.injector.inject(dataset, openas, notebook);
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
    injector: Injector;
    _serverSettings: ServerConnection.ISettings;

    constructor(props: IProps) {
        super(props);
        this._serverSettings = ServerConnection.makeSettings();
        this.injector = new Injector();
        this.state = {
            catalog_url: 'http://localhost:8080/thredds/catalog.xml',
            openas: this.injector.default,
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
        const datasets = this.state.datasets.map((d) => (
            <ThreddsDataset key={d.id} dataset={d} onClick={this.onDatasetClick} disabled={this.injector.supportedDataset(d, this.state.openas)}/>
        ));
        const injectors = this.injector.injectors.map((c) => (
            <option value={c.id}>{c.label}</option>
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
                                {injectors}
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
                        {datasets}
                    </ul>
                </div>
            </div>
        );
    }
}