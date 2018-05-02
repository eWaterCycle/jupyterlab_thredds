import { ILayoutRestorer, JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';

import '../style/index.css';
import { ThreddsFileBrowser } from './widget';

/**
 * The plugin registration information.
 */
const plugin: JupyterLabPlugin<void> = {
  activate,
  autoStart: true,
  id: 'jupyterlab-thredds',
  requires: [INotebookTracker, ILayoutRestorer],
};

const NAMESPACE = 'thredds-filebrowser';

/**
 * Activate the extension.
 */
function activate(app: JupyterLab, tracker: INotebookTracker, restorer: ILayoutRestorer) {
  const threddsBrowser = new ThreddsFileBrowser(tracker);

  restorer.add(threddsBrowser, NAMESPACE);
  app.shell.addToLeftArea(threddsBrowser, { rank: 700 });
}

/**
 * Export the plugin as default.
 */
export default plugin;
