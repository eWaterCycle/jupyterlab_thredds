import asyncio
import json
import logging

import aiohttp
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler

from ..config import ThreddsConfig

logger = logging.getLogger(__name__)


class EsfgHandler(IPythonHandler):
    """
    A ESGF catalog crawler
    """
    async def search(self):
        url = self.get_argument('catalog_url')
        query = self.get_argument('query')
        params = {
            'offset': '0',
            'limit': '250',  # TODO Add paging to widget
            'query': query,
            'type': 'File',
            'replica': 'false',
            'latest': 'true',
            'format': 'application/solr+json',
            'fields': 'id,title,url',
        }
        logger.info(f'Fetching esgf files from {url}')
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as resp:
                response = await resp.json(content_type='text/json')
                return results2json(response['response']['docs'])

    async def get(self):
        c = ThreddsConfig(config=self.config)
        datasets = await asyncio.wait_for(self.search(), c.timeout)
        self.finish(datasets)


def results2json(results):
    return json.dumps([result2json(result) for result in results])


def service2url(surl):
    url, content_type, service_name = surl.split('|')
    # a esgf files opendap url points to the thredss info page
    # the page contains the opendap data url,
    # but instead of fetching the page and parsing will transform html url to opendap data url
    if content_type == 'application/opendap-html' and url.endswith('.nc.html'):
        url = url[:-5]  # remove .html
    return service_name, url


def result2json(result):
    services = {service_name: url for service_name, url in [service2url(u) for u in result['url']]}

    return {
        'name': result['title'],
        'id': result['id'],
        'services': services
    }


def esgf_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/esgf')
    return endpoint, EsfgHandler
