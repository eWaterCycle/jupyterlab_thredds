import json

from requests import RequestException
from traitlets import Integer
from traitlets.config import Configurable
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from thredds_crawler.crawl import Crawl
from owslib.wms import WebMapService


class ThreddsConfig(Configurable):
    """
    Configuration of Threddds catalog crawler

    """
    workers = Integer(4, config=True, help='Number of workers to use for crawling')


def flatten_dataset(dataset):
    services = []
    for service in dataset.services:
        if service['service'].lower() == 'wms':
            try:
                service['layers'] = wms_layers(service['url'])
            except RequestException:
                # Unable to fetch capabilities of wms service, skip the service
                continue
        services.append(service)
    return {
        'id': dataset.id,
        'name': dataset.name,
        'catalog_url': dataset.catalog_url,
        'services': services,
        'data_size': dataset.data_size
    }


def wms_layers(wms_url):
    wms = WebMapService(wms_url)
    return list(wms.contents.keys())


class ThreddsHandler(IPythonHandler):
    """
    A thredds catalog crawler
    """

    def data_received(self, chunk):
        pass

    def get(self):
        catalog_url = self.get_argument('catalog_url')
        self.set_header('Content-Type', 'application/json')
        c = ThreddsConfig(config=self.config)
        crawl = Crawl(catalog_url, workers=c.workers)
        datasets = sorted([flatten_dataset(d) for d in crawl.datasets], key=lambda d: d['id'])
        self.finish(json.dumps(datasets))


def _jupyter_server_extension_paths():
    return [{
        'module': 'jupyterlab_thredds'
    }]


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.
    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    base_url = web_app.settings['base_url']
    endpoint = url_path_join(base_url, '/thredds')
    handlers = [(endpoint, ThreddsHandler)]
    web_app.add_handlers('.*$', handlers)
