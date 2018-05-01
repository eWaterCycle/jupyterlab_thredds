import { xml2js } from 'xml-js';

export function getCapabilities(baseUrl: string) {
    let url = baseUrl;
    if (baseUrl.indexOf('?') === -1) {
        url += '?';
    }
    url += '&request=GetCapabilities&service=WMSversion=1.3.0';
    fetch(url)
        .then(r => r.text())
        .then(txt => {
            return xml2js(txt, {compact: true});
        })
    ;
}
