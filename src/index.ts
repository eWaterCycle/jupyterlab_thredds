import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';
import {
  ToolbarButton
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel, INotebookTracker
} from '@jupyterlab/notebook';

import '../style/index.css';
import { CodeCellModel } from '@jupyterlab/cells';
import { ThreddsFileBrowser } from './browser';


/**
 * The plugin registration information.
 */
const plugin: JupyterLabPlugin<void> = {
  activate,
  requires: [INotebookTracker, ILayoutRestorer],
  id: 'jupyterlab-thredds',
  autoStart: true
};


/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export
  class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let callback = () => {
      const value = 'cube = iris.load_cube("http://172.17.0.2:8080/thredds/dodsC/ewc/2017-11-21/work01/output/netcdf/discharge_dailyTot_output.nc")';
      const cell = new CodeCellModel({
        cell: {
          cell_type: 'code',
          source: [value],
          metadata: { trusted: false, collapsed: false }
        }
      })
      panel.model.cells.push(cell);
    };
    let button = new ToolbarButton({
      className: 'myButton',
      onClick: callback,
      tooltip: 'Add cell',
    });

    let i = document.createElement('i');
    i.classList.add('fa', 'fa-fast-forward');
    button.node.appendChild(i);

    panel.toolbar.insertItem(0, 'runAll', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

const NAMESPACE = 'thredds-filebrowser';

/**
 * Activate the extension.
 */
function activate(app: JupyterLab, tracker: INotebookTracker, restorer: ILayoutRestorer) {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());

  const threddsBrowser = new ThreddsFileBrowser(tracker);

  restorer.add(threddsBrowser, NAMESPACE);
  app.shell.addToLeftArea(threddsBrowser, { rank: 103 });
};


/**
 * Export the plugin as default.
 */
export default plugin;
