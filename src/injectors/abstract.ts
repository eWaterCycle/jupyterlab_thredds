import { Notebook } from '@jupyterlab/notebook';

import { IDataset } from '../listing';

export abstract class AbstractInjector {
    abstract id: string;
    abstract label: string;
    abstract service: string;

    /**
     * @param dataset Dataset to inject into notebook
     * @param notebook The notebook in which a cell gets injected with the code to use the dataset
     */
    abstract inject(dataset: IDataset, notebook: Notebook): void;

    /**
     * @param dataset Dataset to check if it is supported by this injector
     * @returns Whether dataset is supported by this injector based on the services of the dataset
     */
    supports(dataset: IDataset) {
        return dataset.services.hasOwnProperty(this.service);
    }
}
