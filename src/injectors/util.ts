import { CodeCellModel } from '@jupyterlab/cells';

import { IDataset } from '../listing';

export function urlOfService(dataset: IDataset, service: string) {
    return dataset.services[service];
}

export function codeCell(code: string) {
    return new CodeCellModel({
        cell: {
            cell_type: 'code',
            metadata: { trusted: false, collapsed: false, tags: ['injected by THREDDS browser'] },
            source: [code],
        },
    });
}
