import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  INotebookTracker
} from '@jupyterlab/notebook';

import '../style/index.css';
import { ThreddsFileBrowser } from './browser';
import { ISettingRegistry } from '@jupyterlab/coreutils';


/**
 * The plugin registration information.
 */
const plugin: JupyterLabPlugin<void> = {
  activate,
  requires: [INotebookTracker, ILayoutRestorer, ISettingRegistry],
  id: 'jupyterlab-thredds',
  autoStart: true
};

const NAMESPACE = 'thredds-filebrowser';
const PLUGIN_ID = '@ewatercycle/thredds:browser';

/**
 * Activate the extension.
 */
function activate(app: JupyterLab, tracker: INotebookTracker, restorer: ILayoutRestorer, registry: ISettingRegistry) {
  const threddsBrowser = new ThreddsFileBrowser(tracker, 'http://localhost:8080/thredds/catalog.xml', 'iris');

  restorer.add(threddsBrowser, NAMESPACE);
  app.shell.addToLeftArea(threddsBrowser, { rank: 700 });

  const onSettingsUpdated = (settings: ISettingRegistry.ISettings) => {
    const c = settings.get('catalogUrl').composite as string | null | undefined || 'http://localhost:8080/thredds/catalog.xml';
    threddsBrowser.setCatalogUrl(c);
    const o = settings.get('openAs').composite as string || 'iris';
    threddsBrowser.setOpenAs(o);
  };

  Promise.all([registry.load(PLUGIN_ID), app.restored])
    .then(([settings]) => {
      settings.changed.connect(onSettingsUpdated);
      onSettingsUpdated(settings);

    });

  return;
};


/**
 * Export the plugin as default.
 */
export default plugin;
