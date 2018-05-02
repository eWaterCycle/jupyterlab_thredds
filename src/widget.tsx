import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { showErrorMessage } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Widget } from '@phosphor/widgets';
import { Injector } from './injector';

import { ThreddsCatalogBrowser } from './browser';
import { IDataset } from './listing';

export class ThreddsFileBrowser extends Widget {
    injector: Injector;
    tracker: INotebookTracker;
    constructor(tracker: INotebookTracker) {
        super();
        this.title.label = 'THREDDS';
        this.id = 'thredds-file-browser';
        this.addClass('jp-ThreddsBrowser');
        this.tracker = tracker;
        this.injector = new Injector();
        this.update();
    }

    onUpdateRequest() {
        ReactDOM.unmountComponentAtNode(this.node);
        ReactDOM.render(<ThreddsCatalogBrowser open={this.onOpen} />, this.node);
    }

    onOpen = (dataset: IDataset, openas: string) => {
        if (!this.tracker.currentWidget) {
            showErrorMessage('Unable to inject cell without an active notebook', {});
            return;
        }
        const notebook = this.tracker.currentWidget.notebook;
        this.injector.inject(dataset, openas, notebook);
    }
}
