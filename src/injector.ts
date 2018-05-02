import { showErrorMessage } from '@jupyterlab/apputils';
import { Notebook } from '@jupyterlab/notebook';

import { AbstractInjector } from './injectors/abstract';
import { DownloadInjector } from './injectors/download';
import { InjectException } from './injectors/error';
import { IrisInjector } from './injectors/python/iris';
import { LeafletInjector } from './injectors/python/leaflet';
import { XarrayInjector } from './injectors/python/xarray';
import { IDataset } from './listing';

export class Injector {
    readonly injectors: AbstractInjector[] = [
        new IrisInjector(),
        new XarrayInjector(),
        new LeafletInjector(),
        new DownloadInjector(),
    ];
    readonly default = this.injectors[0].id;

    /**
     *
     * @param dataset Dataset to inject into notebook
     * @param openas How the dataset should be injected
     * @param notebook The notebook in which a cell gets injected with the code to use the dataset
     */
    inject(dataset: IDataset, openas: string, notebook: Notebook) {
        const injector = this.findInjector(openas);
        try {
            injector.inject(dataset, notebook);
        } catch (error) {
            if (error instanceof InjectException) {
                showErrorMessage(error.message, error);
            } else {
                // tslint:disable-next-line:no-console
                console.error(error);
            }
        }
    }

    supportedDataset(dataset: IDataset, openas: string) {
        const injector = this.findInjector(openas);
        return injector.supports(dataset);
    }

    private findInjector(openas: string): AbstractInjector {
        return this.injectors.filter((c) => c.id === openas)[0];
    }
}
