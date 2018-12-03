import { IDataset } from '../../listing';
import { CodeInjector } from '../code';
import { urlOfService } from '../util';

export class LeafletInjector extends CodeInjector {
    id =  'leaflet';
    label = 'Leaflet WMS layer';
    service = 'WMS';
    importSnippet = `import ipyleaflet
from owslib.wms import WebMapService
`;
    kernel = 'python';

    pureCode(dataset: IDataset) {
        const url = urlOfService(dataset, this.service);
        return `wms_url = "${url}"
wms_layers = list(WebMapService(wms_url).contents.keys())
wms = ipyleaflet.WMSLayer(url=wms_url, layers=wms_layers[0])`;
    }

    code(dataset: IDataset) {
        return `${this.pureCode(dataset)}
# Uncomment below to view first WMS layer
# m = ipyleaflet.Map(zoom=3)
# m.add_layer(wms)
# m`;
    }
}
