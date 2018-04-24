import * as React from 'react';

export interface IService {
    name: string;
    service: string;
    url: string;
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
    onClick(dataset: IDataset): void;
}

export class ThreddsDataset extends React.Component<IThreddsDatasetProps, {}> {
    onClick = () => {
        this.props.onClick(this.props.dataset);
    }
    render() {
        const d = this.props.dataset;
        return (
            <li key={d.id}><button className="jp-Toolbar-item jp-Toolbar-button" onClick={this.onClick}>{d.name}</button></li>
        );
    }
}

