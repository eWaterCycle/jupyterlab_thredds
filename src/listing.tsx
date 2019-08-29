import * as React from 'react';

/**
 * Services object where key is serviceType in uppercase and value is url of service
 */
export interface IService {
    [Key: string]: string;
}

export interface IDataset {
    id: string;
    name: string;
    services: IService;
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
                        {d.name}
                    </span>
                </li>
            );
        } else {
            return (
                <li key={d.id} title={d.id}>
                    <span className="jp-DirListing-item jp-DirListing-itemText jp-TreddsBrowser-item" onClick={this.onClick}>
                        {d.name}
                    </span>
                </li>
            );
        }
    }
}
