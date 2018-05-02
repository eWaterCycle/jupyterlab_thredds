import * as React from 'react';

export interface IService {
    name: string;
    service: string;
    url: string;
    layers?: string[];
}

export interface IDataset {
    catalog_url: string;
    date_size: number;
    id: string;
    name: string;
    services: IService[];
}

export interface IThreddsDatasetsProps {
    datasets: IDataset[];
    onClick(dataset: IDataset): void;
}

export interface IThreddsDatasetProps {
    dataset: IDataset;
    disabled: boolean;
    onClick(dataset: IDataset): void;
}

export class ThreddsDataset extends React.Component<IThreddsDatasetProps, {}> {
    onClick = () => {
        this.props.onClick(this.props.dataset);
    }
    render() {
        const d = this.props.dataset;
        if (this.props.disabled) {
            return (
                <li key={d.id} title="Can not open file with selected Open as" >
                    <span className="jp-DirListing-item jp-DirListing-itemText jp-TreddsBrowser-item jp-TreddsBrowser-disabled">
                        {d.id}
                    </span>
                </li>
            );
        } else {
            return (
                <li key={d.id} title={d.id}>
                    <span className="jp-DirListing-item jp-DirListing-itemText jp-TreddsBrowser-item" onClick={this.onClick}>
                        {d.id}
                    </span>
                </li>
            );
        }
    }
}
