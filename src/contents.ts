import {
    ISignal
} from '@phosphor/signaling';


import {
    Contents, ServerConnection,
} from '@jupyterlab/services';

export class ThreddsDrive implements Contents.IDrive {
    serverSettings: ServerConnection.ISettings;
    name: 'Thredds';

    fileChanged: ISignal<Contents.IDrive, Contents.IChangedArgs>;

    get(localPath: string, options?: Contents.IFetchOptions): Promise<Contents.IModel> {
        // TODO use Xmlhttprequest to fetch http://172.17.0.2:8080/thredds/catalog/ewc/2017-11-21/work01/output/netcdf/catalog.xml
        // and convert to IModel
        const content = [{
            name: 'totalEvaporation_dailyTot_output.nc',
            path: 'ewc/2017-11-21/work01/output/netcdf/totalEvaporation_dailyTot_output.nc',
            format: 'json',
            type: 'directory',
            created: '',
            writable: false,
            last_modified: '2018-03-26T11:30:18Z',
            mimetype: 'application/x-netcdf',
            content: null
        } as Contents.IModel];
        const model = {
            name: '',
            path: 'http://172.17.0.2:8080/thredds/dodsC/ewc/2017-11-21/work01/output/netcdf/',
            format: 'json',
            type: 'directory',
            created: '',
            last_modified: '',
            writable: false,
            mimetype: '',
            content
        } as Contents.IModel
        return Promise.resolve(model);
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
