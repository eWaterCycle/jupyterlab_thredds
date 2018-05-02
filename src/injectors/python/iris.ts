import { IDataset } from '../../listing';
import { CodeInjector } from '../code';
import { urlOfService } from '../util';

export class IrisInjector extends CodeInjector {
    id =  'iris';
    label = 'Iris data cube';
    service = 'OPENDAP';
    importSnippet = 'import iris';
    kernel = 'python';

    code(dataset: IDataset) {
        const dapUrl = urlOfService(dataset, this.service);
        return `cube = iris.load_cube("${dapUrl}")`;
    }
}
