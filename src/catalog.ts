import {
    Contents
} from '@jupyterlab/services';


export function parseDatasets(doc: Document): Contents.IModel[] {
    const content = [];
    const datasets = doc.getElementsByTagName('dataset');
    for (let index = 0; index < datasets.length; index++) {
        const dataset = datasets[index];
        const name = dataset.attributes.getNamedItem('name').value;
        const id = dataset.attributes.getNamedItem('ID').value;
        const modified = dataset.querySelector('date[type=modified]').innerHTML;
        const model: Contents.IModel = {
            name: name,
            path: id,
            type: 'file',
            format: 'base64',
            created: '',
            last_modified: modified,
            writable: false,
            mimetype: 'application/x-netcdf',
            content: null
        }
        content.push(model);
    }
    return content;
}

export function parseCatalogs(doc: Document, origpath: string): Contents.IModel[] {
    const content = [];
    const catalogRefs = doc.getElementsByTagName('catalogRef');
    for (let index = 0; index < catalogRefs.length; index++) {
        const catalogRef = catalogRefs[index];
        const name = catalogRef.attributes.getNamedItem('xlink:title').value;
        const href = catalogRef.attributes.getNamedItem('xlink:href').value;
        let path;
        if (href.substr(0, 1) === '/') {
            // url = http://localhost:8080/thredds/catalog.xml
            // href = /thredds/catalog/ewc/catalog.xml
            // -> path = http://localhost:8080/thredds/catalog/ewc/catalog.xml
            path = href;
        } else {
            // url = http://localhost:8080/thredds/catalog/ewc/catalog.xml
            // href = 2017-11-21/catalog.xml
            // -> path = http://localhost:8080/thredds/catalog/ewc/2017-11-21/catalog.xml
            // trim filename
            const path1 = origpath.substring(origpath.lastIndexOf('/'));
            path = path1 + href;
        }
        const model: Contents.IModel = {
            name: name,
            path: path,
            type: 'directory',
            format: 'json',
            created: '',
            last_modified: '',
            writable: false,
            mimetype: '',
            content: null
        };
        content.push(model);
    }
    return content;
}