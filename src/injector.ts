import { Notebook, NotebookActions } from "@jupyterlab/notebook";
import { showErrorMessage } from "@jupyterlab/apputils";
import { find } from '@phosphor/algorithm';

import { IDataset, IService } from "./listing";
import { CodeCellModel, ICellModel } from "@jupyterlab/cells";
import { IObservableUndoableList } from "@jupyterlab/observables";


function serviceByType(dataset: IDataset, service: string): IService {
    return dataset.services.filter(s => s.service === service)[0];
}

function urlOfService(dataset: IDataset, service: string) {
    return serviceByType(dataset, service).url;
}

export function codeCell(code: string) {
    return new CodeCellModel({
        cell: {
            cell_type: 'code',
            source: [code],
            metadata: { trusted: false, collapsed: false, tags: ['injected by THREDDS browser'] }
        }
    })
}

class InjectException extends Error {

}

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
        return dataset.services.some(s => s.name === this.service);
    }
}

abstract class CodeInjector extends AbstractInjector {
    importSnippet: string;
    kernel: string;

    abstract code(dataset: IDataset): string;


    notbookHasImport(cells: IObservableUndoableList<ICellModel>, offset = 0) {
        const result = find(cells.iter(), (c, i) => i <= offset && c.type === 'code' && c.value.text.indexOf(this.importSnippet) !== -1);
        return result !== undefined;
    }

    inject(dataset: IDataset, notebook: Notebook) {
        const model = notebook.model;
        if (model.defaultKernelLanguage !== this.kernel) {
            throw new InjectException(`Active notebook uses wrong kernel language. Only ${this.kernel} is supported`);
        }
        if (model.readOnly) {
            throw new InjectException('Unable to inject cell into read-only notebook');
        }
        let code = '';
        const activeCellIndex = notebook.activeCellIndex;
        if (this.importSnippet && !this.notbookHasImport(model.cells, activeCellIndex)) {
            code += this.importSnippet + "\n";
        }
        code += this.code(dataset);
        const cell = codeCell(code);
        model.cells.insert(activeCellIndex + 1, cell);
        NotebookActions.selectBelow(notebook);
    }
}

class IrisInjector extends CodeInjector {
    id =  'iris';
    label = 'Iris data cube';
    service = 'OPENDAP';
    importSnippet = 'import iris';
    kernel = 'python';

    code(dataset: IDataset) {
        const dap_url = urlOfService(dataset, this.service);
        return `cube = iris.load_cube("${dap_url}")`;
    }
}

class XarrayInjector extends CodeInjector {
    id =  'xarray';
    label = 'xarray dataset';
    service = 'OPENDAP';
    importSnippet = 'import xarray as xr';
    kernel = 'python';

    code(dataset: IDataset) {
        const dap_url = urlOfService(dataset, this.service);
        return `ds = xr.open_dataset("${dap_url}")`;
    }
}

class LeafletInjector extends CodeInjector {
    id =  'leaflet';
    label = 'Leaflet WMS layer';
    service = 'WMS';
    importSnippet = 'import ipyleaflet';
    kernel = 'python';

    pureCode(dataset: IDataset) {
        const service = serviceByType(dataset, this.service);
        if (service.layers.length === 1) {
            return `wms = ipyleaflet.WMSLayer(url="${service.url}", layers="${service.layers[0]}")`;
        } else {
            const layers = JSON.stringify(service.layers);
            return `wms = ipyleaflet.WMSLayer(url="${service.url}", layers=${layers}[0])`;
        }
    }

    code(dataset: IDataset) {
        let code = `# Uncomment to view layer
# m = ipyleaflet.Map(zoom=3)
${this.pureCode(dataset)}
# m.add_layer(wms)
# m`;
        return code;
    }
}

class DownloadInjector extends AbstractInjector {
    id = 'download';
    label = 'Download';
    service = 'HTTPServer';

    inject(dataset: IDataset, notebook: Notebook): void {
        window.open(urlOfService(dataset, this.service));
    }
}

export class Injector {
    readonly injectors: AbstractInjector[] = [
        new IrisInjector(), 
        new XarrayInjector(),
        new LeafletInjector(),
        new DownloadInjector()
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
                console.error(error);
            }
        }
    }

    private findInjector(openas: string): AbstractInjector {
        return this.injectors.filter(c => c.id === openas)[0];
    }

    supportedDataset(dataset: IDataset, openas: string) {
        const injector = this.findInjector(openas);
        return injector.supports(dataset);
    }
}
