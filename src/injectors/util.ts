import { CodeCellModel } from '@jupyterlab/cells';

import { IDataset, IService } from '../listing';

export function serviceByType(dataset: IDataset, service: string): IService {
    return dataset.services.filter((s) => s.service.toLowerCase() === service.toLowerCase())[0];
}

export function urlOfService(dataset: IDataset, service: string) {
    return serviceByType(dataset, service).url;
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
