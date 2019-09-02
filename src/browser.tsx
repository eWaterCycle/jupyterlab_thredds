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
    busy: boolean;
    error: string;
    source: 'THREDDS' | 'ESGF';
    query: string;
}

export class ThreddsCatalogBrowser extends React.Component<IProps, IState> {
    injector: Injector;
    private serverSettings: ServerConnection.ISettings;

    constructor(props: IProps) {
        super(props);
        this.serverSettings = ServerConnection.makeSettings();
        this.injector = new Injector();
        this.state = {
            busy: false,
            catalog_url: 'http://localhost:8080/thredds/catalog.xml',
            datasets: [],
            error: '',
            openas: this.injector.default,
            query: '',
            source: 'THREDDS',
        };
    }

    handleSubmit = (event: any) => {
        this.fetchDatasets();
        event.preventDefault();
    }

    fetchDatasets() {
        switch (this.state.source) {
            case 'THREDDS':
                this.fetchThreddsDatasets();
                break;
            case 'ESGF':
                this.fetchEsgfDatasets();
                break;
            default:
                break;
        }
    }

    fetchEsgfDatasets(): any {
        const query = {
            catalog_url: this.state.catalog_url,
            query: this.state.query,
        };
        const url = URLExt.join(this.serverSettings.baseUrl, 'esgf') + URLExt.objectToQueryString(query);
        this.setState({
            busy: true,
            datasets: [],
            error: '',
        });
        ServerConnection.makeRequest(url, {}, this.serverSettings).then(async (response) => {
            const data = await response.json();
            if (response.ok) {
                this.setState({
                    busy: false,
                    datasets: data,
                });
            } else {
                this.setState({
                    busy: false,
                    error: data.title,
                });
            }
        }).catch((reason) => {
            this.setState({
                busy: false,
                error: reason,
            });
        });
    }

    fetchThreddsDatasets() {
        const query = { catalog_url: this.state.catalog_url };
        const url = URLExt.join(this.serverSettings.baseUrl, 'thredds') + URLExt.objectToQueryString(query);
        this.setState({
            busy: true,
            datasets: [],
            error: '',
        });
        ServerConnection.makeRequest(url, {}, this.serverSettings).then(async (response) => {
            const data = await response.json();
            if (response.ok) {
                this.setState({
                    busy: false,
                    datasets: data,
                });
            } else {
                this.setState({
                    busy: false,
                    error: data.title,
                });
            }
        }).catch((reason) => {
            this.setState({
                busy: false,
                error: reason,
            });
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

    setTHREDDSasSource = () => {
        this.setState({source: 'THREDDS'});
    }

    setESGFasSource = () => {
        if (this.state.catalog_url.indexOf('esg-search') !== -1) {
            this.setState({source: 'ESGF'});
        } else {
            this.setState({source: 'ESGF', catalog_url: 'https://esgf-node.llnl.gov/esg-search/search'});
        }
    }

    onQueryChange = (event: any) => {
        this.setState({ query: event.target.value });
    }

    loadQueryExample1 = () => {
        const query = 'id:CMIP6.DCPP.IPSL.IPSL-CM6A-LR.dcppC-amv-neg.r27i1p1f1.*';
        const catalogUrl = 'https://esgf-node.llnl.gov/esg-search/search';
        const source = 'ESGF';
        this.setState({source, query, catalog_url: catalogUrl});
    }

    loadQueryExample2 = () => {
        const query = 'project:CMIP6 AND variable:tas AND frequency:mon AND experiment_id:historical AND member_id:r1i1p1f1';
        const catalogUrl = 'https://esgf-node.llnl.gov/esg-search/search';
        const source = 'ESGF';
        this.setState({source, query, catalog_url: catalogUrl});
    }

    render() {
        const datasets = this.state.datasets.map((d) => (
            <ThreddsDataset key={d.id} dataset={d} onClick={this.onDatasetClick} disabled={!this.injector.supportedDataset(d, this.state.openas)} />
        ));
        const injectors = this.injector.injectors.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
        ));
        const style = {
            backgroundColor: '#545b62',
            color: '#fff',
        };
        let form: JSX.Element;
        if (this.state.source === 'THREDDS') {
            form = (
                <div className="p-Widget">
                    <label>THREDDS Catalog URL</label>
                    <div className="jp-TreddsBrowser-wrapper">
                        <input disabled={this.state.busy} className="jp-mod-styled jp-TreddsBrowser-input" type="text" value={this.state.catalog_url} onChange={this.onCatalogUrlChange} />
                    </div>
                </div>
            );
        } else if (this.state.source === 'ESGF') {
            form = (
                <div className="p-Widget">
                    <label>ESGF search service URL (ends with /esg-search/search)</label>
                    <div className="jp-TreddsBrowser-wrapper">
                        <input disabled={this.state.busy} className="jp-mod-styled jp-TreddsBrowser-input" type="text" value={this.state.catalog_url} onChange={this.onCatalogUrlChange} />
                    </div>
                    <label>Query</label>
                    <div className="jp-TreddsBrowser-wrapper">
                        <input disabled={this.state.busy} type="text" className="jp-mod-styled jp-TreddsBrowser-input" value={this.state.query} onChange={this.onQueryChange}/>
                        (<a onClick={this.loadQueryExample1}>Example 1</a>, <a onClick={this.loadQueryExample2}>Example 2</a>)
                    </div>
                </div>
            );
        }
        return (
            <div>
                <div className="jp-Toolbar">
                    <div className="jp-Toolbar-item jp-ToolbarButton">
                        <button
                            className="jp-ToolbarButtonComponent"
                            disabled={this.state.source === 'THREDDS'}
                            onClick={this.setTHREDDSasSource}
                            style={this.state.source === 'THREDDS' ? style : {}}
                        >
                            THREDDS
                        </button>
                    </div>
                    <div className="jp-Toolbar-item jp-ToolbarButton">
                        <button
                            className="jp-ToolbarButtonComponent"
                            disabled={this.state.source === 'ESGF'}
                            onClick={this.setESGFasSource}
                            style={this.state.source === 'ESGF' ? style : {}}
                        >
                                ESGF
                        </button>
                    </div>
                    <div className="jp-Toolbar-spacer jp-Toolbar-item"/>
                </div>
                <form className="p-Widget" onSubmit={this.handleSubmit}>
                    {form}
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
                        <input className="jp-mod-styled jp-TreddsBrowser-input" type="submit" value="Fetch datasets" />
                    </div>
                </form>
                <hr />
                {this.state.busy && <span className="jp-ThreddsBrowser-busy">Crawling catalog, please wait</span>}
                {this.state.error && <span className="jp-ThreddsBrowser-fetcherror">Error: {this.state.error}</span>}
                <div className="p-Widget jp-DirListing">
                    <ul className="jp-DirListing-content">
                        {datasets}
                    </ul>
                </div>
            </div>
        );
    }
}
