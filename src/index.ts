import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';


/**
 * Initialization data for the jupyterlab_thredds extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_thredds',
  autoStart: true,
  activate: (app: JupyterLab) => {
    console.log('JupyterLab extension jupyterlab_thredds is activated!');
  }
};

export default extension;
