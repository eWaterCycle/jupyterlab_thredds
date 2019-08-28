import { ILayoutRestorer, JupyterFrontEndPlugin, JupyterFrontEnd } from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';

import '../style/index.css';
import { ThreddsFileBrowser } from './widget';

/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  autoStart: true,
  id: 'jupyterlab-thredds',
  requires: [INotebookTracker, ILayoutRestorer],
};

const NAMESPACE = 'thredds-filebrowser';

/**
 * Activate the extension.
 */
function activate(app: JupyterFrontEnd, tracker: INotebookTracker, restorer: ILayoutRestorer) {
  const threddsBrowser = new ThreddsFileBrowser(tracker);

  restorer.add(threddsBrowser, NAMESPACE);
  app.shell.add(threddsBrowser, "left", { rank: 700});
}

/**
 * Export the plugin as default.
 */
export default plugin;
