import { Notebook } from '@jupyterlab/notebook';

import { IDataset } from '../listing';
import { AbstractInjector } from './abstract';
import { urlOfService } from './util';

export class DownloadInjector extends AbstractInjector {
    id = 'download';
    label = 'Download';
    service = 'HTTPServer';

    inject(dataset: IDataset, notebook: Notebook): void {
        window.open(urlOfService(dataset, this.service));
    }
}
