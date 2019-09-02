import asyncio
import json

from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join

from ..config import ThreddsConfig
from ..crawler import TDSCrawler, CrawlerError


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

            self.finish(json.dumps(sorted(datasets, key=lambda d: d['id'])))
        except CrawlerError as e:
            self.set_status(500)
            self.set_header('Content-Type', 'application/problem+json')
            # Use https://tools.ietf.org/html/draft-ietf-appsawg-http-problem-00 format
            error = {
                "title": str(e),
                "url": e.url
            }
            self.finish(json.dumps(error))


def thredds_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/thredds')
    return endpoint, ThreddsHandler
