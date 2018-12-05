from typing import Dict
import asyncio
import logging

import aiohttp
import xml.etree.ElementTree as ET
from siphon.catalog import TDSCatalog, Dataset, DatasetCollection, CaseInsensitiveStr, SimpleService, CompoundService, \
    _find_base_tds_url


logger = logging.getLogger(__name__)


def ds2json(dataset: Dataset) -> Dict:
    """Converts siphon.catalog.Dataset to a simple dictionary that is JSON serializable
    """
    services = {k.upper(): v for k, v in dataset.access_urls.items()}
    return {
        'name': dataset.name,
        'id': dataset.url_path,
        'services': services
    }


class AsyncTDSCatalog(TDSCatalog):
    def __init__(self, catalog_url: str, content: str):
        """Same as siphon.catalog.TDSCatalog, but with constructor which takes url and response

        So it can be used by a generic asynchronous web crawler

        Args:
            catalog_url: URL with THREDDS catalog xml file
            content: Content found at catalog_url
        """
        self.catalog_url = catalog_url
        self.base_tds_url = _find_base_tds_url(self.catalog_url)

        # begin parsing the xml doc
        root = ET.fromstring(content)
        self.catalog_name = root.attrib.get('name', 'No name found')

        self.datasets = DatasetCollection()
        self.services = []
        self.catalog_refs = DatasetCollection()
        self.metadata = {}
        self.ds_with_access_elements_to_process = []
        service_skip_count = 0
        service_skip = 0
        current_dataset = None
        previous_dataset = None
        for child in root.iter():
            tag_type = child.tag.split('}')[-1]
            if tag_type == 'dataset':
                current_dataset = child.attrib['name']
                self._process_dataset(child)

                if previous_dataset:
                    # see if the previously processed dataset has access elements as children
                    # if so, these datasets need to be processed specially when making
                    # access_urls
                    if self.datasets[previous_dataset].access_element_info:
                        self.ds_with_access_elements_to_process.append(previous_dataset)

                previous_dataset = current_dataset

            elif tag_type == 'access':
                self.datasets[current_dataset].add_access_element_info(child)
            elif tag_type == 'catalogRef':
                self._process_catalog_ref(child)
            elif (tag_type == 'metadata') or (tag_type == ''):
                self._process_metadata(child, tag_type)
            elif tag_type == 'service':
                if CaseInsensitiveStr(child.attrib['serviceType']) \
                        != CaseInsensitiveStr('Compound'):
                    # we do not want to process single services if they
                    # are already contained within a compound service, so
                    # we need to skip over those cases.
                    if service_skip_count >= service_skip:
                        self.services.append(SimpleService(child))
                        service_skip = 0
                        service_skip_count = 0
                    else:
                        service_skip_count += 1
                else:
                    self.services.append(CompoundService(child))
                    service_skip = self.services[-1].number_of_subservices
                    service_skip_count = 0

        self._process_datasets()


class CrawlerError(Exception):
    def __init__(self, message: str, url: str) -> None:
        super().__init__(message)
        self.url = url


class CrawlerFetchError(CrawlerError):
    def __init__(self, url: str) -> None:
        message = 'Failed to fetch {0}'.format(url)
        super().__init__(message, url)


class CrawlerXmlError(CrawlerError):
    def __init__(self, url: str) -> None:
        message = '{0} not in XML format'.format(url)
        super().__init__(message, url)


class TDSCrawler:
    def __init__(self, rooturl: str, loop, maxtasks=10):
        """Asynchronous THREDDS catalog crawler

        Crawler based on https://github.com/aio-libs/aiohttp/blob/master/examples/legacy/crawl.py

        Args:
            rooturl: URL with THREDDS catalog xml file
            loop: Event loop, eg. asyncio.get_event_loop()
            maxtasks: Number of download tasks to run concurrently
        """
        self.rooturl = rooturl
        self.loop = loop
        self.todo = set()
        self.busy = set()
        self.done = {}
        self.tasks = set()
        self.sem = asyncio.Semaphore(maxtasks, loop=loop)
        self.session = aiohttp.ClientSession(loop=loop)
        self.datasets = []

    async def run(self):
        """Starts crawling the catalog recursively

        Returns:
            List of datasets
        """
        delay = 0.2
        t = asyncio.ensure_future(self.addurls([self.rooturl]),
                                  loop=self.loop)
        await asyncio.sleep(delay, loop=self.loop)
        while self.busy:
            await asyncio.sleep(delay, loop=self.loop)

        await t
        await self.session.close()
        return self.datasets

    async def addurls(self, urls):
        for url in urls:
            if (url not in self.busy and
                    url not in self.done and
                    url not in self.todo):
                self.todo.add(url)
                await self.sem.acquire()
                task = asyncio.ensure_future(self.process(url), loop=self.loop)
                task.add_done_callback(lambda t: self.sem.release())
                task.add_done_callback(self.tasks.remove)
                self.tasks.add(task)
                await task  # TODO waiting for task here will not make multiple tasks run concurrently, but if not exception are not captured

    async def process(self, url):
        logger.info('processing: %s', url)

        self.todo.remove(url)
        self.busy.add(url)
        try:
            resp = await self.session.get(url)
            resp.raise_for_status()
        except Exception as exc:
            self.done[url] = False
            raise CrawlerFetchError(url) from exc
        else:
            if 'application/xml' in resp.headers.get('Content-Type'):
                data = (await resp.read()).decode('utf-8', 'replace')
                cat = AsyncTDSCatalog(url, data)
                urls = [c.href for c in cat.catalog_refs.values()]
                await asyncio.Task(self.addurls(urls))
                self.datasets += [ds2json(d) for d in cat.datasets.values()]
                self.done[url] = True
                resp.close()
            else:
                self.done[url] = False
                resp.close()
                raise CrawlerXmlError(url)
        finally:
            self.busy.remove(url)
            logger.info('%s completed tasks, %s still pending, todo %s',
                        len(self.done), len(self.tasks), len(self.todo))
