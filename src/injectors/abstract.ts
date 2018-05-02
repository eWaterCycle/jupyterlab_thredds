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

    supports(dataset: IDataset) {
        return dataset.services.some((s) => s.name === this.service);
    }
}
