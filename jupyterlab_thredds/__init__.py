import asyncio
import json

from traitlets import Integer
from traitlets.config import Configurable
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler

from jupyterlab_thredds.crawler import TDSCrawler, CrawlerError


class ThreddsConfig(Configurable):
    """
    Configuration of THREDDS catalog crawler

    """
    maxtasks = Integer(10, config=True, help='Number of download tasks to run concurrently')
    timeout = Integer(600, config=True, help='Maximum number of seconds to perform crawl')


class ThreddsHandler(IPythonHandler):
    """
    A THREDDS catalog crawler
    """
    async def get(self):
        catalog_url = self.get_argument('catalog_url')
        self.set_header('Content-Type', 'application/json')
        c = ThreddsConfig(config=self.config)
        loop = asyncio.get_event_loop()
        crawler = TDSCrawler(catalog_url, loop, maxtasks=c.maxtasks)
        try:
            datasets = await asyncio.wait_for(crawler.run(), c.timeout)

            self.finish(json.dumps(datasets))
        except CrawlerError as e:
            self.set_status(500)
            self.set_header('Content-Type', 'application/problem+json')
            # Use https://tools.ietf.org/html/draft-ietf-appsawg-http-problem-00 format
            error = {
                "title": str(e),
                "url": e.url
            }
            self.finish(json.dumps(error))


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
