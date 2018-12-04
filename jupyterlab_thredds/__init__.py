import asyncio
import json

from traitlets import Integer
from traitlets.config import Configurable
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler

from jupyterlab_thredds.crawler import TDSCrawler


class ThreddsConfig(Configurable):
    """
    Configuration of Threddds catalog crawler

    """
    workers = Integer(4, config=True, help='Number of workers to use for crawling')


class ThreddsHandler(IPythonHandler):
    """
    A thredds catalog crawler
    """

    def data_received(self, chunk):
        pass

    async def get(self):
        catalog_url = self.get_argument('catalog_url')
        self.set_header('Content-Type', 'application/json')
        # c = ThreddsConfig(config=self.config)
        # c.workers
        loop = asyncio.get_event_loop()
        crawler = TDSCrawler(catalog_url, loop)
        timeout = 120
        datasets = await asyncio.wait_for(crawler.run(), timeout)
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
