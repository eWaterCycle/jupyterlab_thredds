import { IDataset } from '../../listing';
import { CodeInjector } from '../code';
import { urlOfService } from '../util';

export class XarrayInjector extends CodeInjector {
    id =  'xarray';
    label = 'xarray dataset';
    service = 'OPENDAP';
    importSnippet = 'import xarray as xr';
    kernel = 'python';

    code(dataset: IDataset) {
        const dapUrl = urlOfService(dataset, this.service);
        return `ds = xr.open_dataset("${dapUrl}")`;
    }
}
