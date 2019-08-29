import json

from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from pyesgf.search import SearchConnection


class EsfgHandler(IPythonHandler):
    """
    A ESGF catalog crawler
    """
    async def get(self):
        catalog_url = self.get_argument('catalog_url')
        self.set_header('Content-Type', 'application/json')
        conn = SearchConnection(catalog_url, distrib=True)
        ctx = conn.new_context()
        query = self.get_argument('query')
        results = ctx.search(query=query)        
        self.finish(results2json(results))


def results2json(results):
    return json.dumps([result2json(result) for result in results])


def result2json(result):
    # TODO dont just take first file, but return all files belonging to the ESGF entry and handle it in the web browser
    files = result.file_context().search()[0]
    return {
        'name': result.dataset_id,
        'id': result.dataset_id,
        'services': {
            'OPENDAP': files.opendap_url,
            'HTTPSERVER': files.download_url,
            # 'GridFTP': files.gridftp_url,
        }
    }


def esgf_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/esgf')
    return endpoint, EsfgHandler
