import * as React from 'react';

import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

import { Injector } from './injector';
import { IDataset, ThreddsDataset } from './listing';

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
    private serverSettings: ServerConnection.ISettings;

    constructor(props: IProps) {
        super(props);
        this.serverSettings = ServerConnection.makeSettings();
        this.injector = new Injector();
        this.state = {
            catalog_url: 'http://localhost:8080/thredds/catalog.xml',
            datasets: [],
            openas: this.injector.default,
        };
    }

    handleSubmit = (event: any) => {
        this.fetchDatasets(this.state.catalog_url);
        event.preventDefault();
    }

    fetchDatasets(catalogUrl: string) {
        const query = { catalog_url: this.state.catalog_url };
        const url = URLExt.join(this.serverSettings.baseUrl, 'thredds') + URLExt.objectToQueryString(query);
        ServerConnection.makeRequest(url, {}, this.serverSettings).then((response) => {
            if (response.status !== 200) {
                return response.json().then((data) => {
                    throw new ServerConnection.ResponseError(response, data.message);
                });
            }
            return response.json();
        }).then((datasets) => {
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
