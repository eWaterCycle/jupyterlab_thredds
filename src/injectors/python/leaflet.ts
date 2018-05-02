import { IDataset } from '../../listing';
import { CodeInjector } from '../code';
import { serviceByType } from '../util';

export class LeafletInjector extends CodeInjector {
    id =  'leaflet';
    label = 'Leaflet WMS layer';
    service = 'WMS';
    importSnippet = 'import ipyleaflet';
    kernel = 'python';

    pureCode(dataset: IDataset) {
        const service = serviceByType(dataset, this.service);
        if (service.layers.length === 1) {
            return `wms = ipyleaflet.WMSLayer(url="${service.url}", layers="${service.layers[0]}")`;
        } else {
            const layers = JSON.stringify(service.layers);
            return `wms = ipyleaflet.WMSLayer(url="${service.url}", layers=${layers}[0])`;
        }
    }

    code(dataset: IDataset) {
        return `# Uncomment to view layer
# m = ipyleaflet.Map(zoom=3)
${this.pureCode(dataset)}
# m.add_layer(wms)
# m`;
    }
}
