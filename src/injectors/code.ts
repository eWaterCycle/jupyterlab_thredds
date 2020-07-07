import { ICellModel } from '@jupyterlab/cells';
import { Notebook, NotebookActions } from '@jupyterlab/notebook';
import { IObservableUndoableList } from '@jupyterlab/observables';
import { find } from '@lumino/algorithm';

import { IDataset } from '../listing';
import { AbstractInjector } from './abstract';
import { InjectException } from './error';
import { codeCell } from './util';

export abstract class CodeInjector extends AbstractInjector {
    importSnippet: string;
    kernel: string;

    abstract code(dataset: IDataset): string;

    notebookHasImport(cells: IObservableUndoableList<ICellModel>, offset = 0) {
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
        if (this.importSnippet && !this.notebookHasImport(model.cells, activeCellIndex)) {
            code += this.importSnippet + '\n';
        }
        code += this.code(dataset);
        const cell = codeCell(code);
        model.cells.insert(activeCellIndex + 1, cell);
        NotebookActions.selectBelow(notebook);
    }
}
