import * as urlparse from 'url-parse';

import {
    Signal
} from '@phosphor/signaling';

import {
    Contents, ServerConnection
} from '@jupyterlab/services';
import { parseDatasets, parseCatalogs } from './catalog';

export class ThreddsDrive implements Contents.IDrive {
    _baseUrl: string = '';
    serverSettings: ServerConnection.ISettings = ServerConnection.makeSettings();
    fileChanged = new Signal<this, Contents.IChangedArgs>(this);

    set baseUrl(newValue: string) {
        this._baseUrl = newValue;
    }

    get(localPath: string, options?: Contents.IFetchOptions): Promise<Contents.IModel> {
        // no server and no path
        if (localPath === '' && this._baseUrl === '') {
            const model: Contents.IModel = {
                type: 'directory',
                path: '',
                name: '',
                format: 'json',
                content: [],
                created: '',
                writable: false,
                last_modified: '',
                mimetype: '',
            };
            return Promise.resolve(model);
        }

        console.log([this._baseUrl, localPath]);
        // const url = 'http://localhost:8080/thredds/ewc/2017-11-21/work01/output/netcdf/catalog.xml';
        const urlp = urlparse(this._baseUrl);
        urlp.set('pathname', localPath);
        const url = urlp.href;
        return fetch(url)
            .then(r => {
                return r.text();
            })
            .then(txt => {
                const parser = new DOMParser();
                return parser.parseFromString(txt, "text/xml");
            })
            .then(r => {
                const content: Contents.IModel[] = [];

                // dirs
                content.concat(parseCatalogs(r, urlp.pathname));

                // files
                content.concat(parseDatasets(r));

                const model: Contents.IModel = {
                    name: '',
                    path: localPath,
                    format: 'json',
                    type: 'directory',
                    created: '',
                    last_modified: '',
                    writable: false,
                    mimetype: '',
                    content
                };
                return model;
            });
    }

    get name(): 'Thredds' {
        return 'Thredds';
    }

    getDownloadUrl(path: string): Promise<string> {
        // TODO convert catalog dataset id to absolute url
        return Promise.resolve(path);
    }
    newUntitled(options?: Contents.ICreateOptions): Promise<Contents.IModel> {
        return Promise.reject('Repository is read only');
    }
    delete(localPath: string): Promise<void> {
        return Promise.reject('Repository is read only');
    }
    rename(oldLocalPath: string, newLocalPath: string): Promise<Contents.IModel> {
        return Promise.reject('Repository is read only');
    }
    save(localPath: string, options?: Partial<Contents.IModel>): Promise<Contents.IModel> {
        return Promise.reject('Repository is read only');
    }
    copy(localPath: string, toLocalDir: string): Promise<Contents.IModel> {
        return Promise.reject('Repository is read only');
    }
    createCheckpoint(localPath: string): Promise<Contents.ICheckpointModel> {
        return Promise.reject('Repository is read only');
    }
    listCheckpoints(localPath: string): Promise<Contents.ICheckpointModel[]> {
        return Promise.resolve([]);
    }
    restoreCheckpoint(localPath: string, checkpointID: string): Promise<void> {
        return Promise.reject('Repository is read only');
    }
    deleteCheckpoint(localPath: string, checkpointID: string): Promise<void> {
        return Promise.reject('Repository is read only');
    }
    isDisposed: boolean;
    dispose(): void {
        // Nothing to do
    }
}
