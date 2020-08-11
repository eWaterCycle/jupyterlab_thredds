import asyncio
import json

import pytest
import vcr

from jupyterlab_thredds.crawler import TDSCrawler, CrawlerFetchError


@pytest.fixture
def expected_crawl_result():
    with open('tests/fixtures/crawler.expected.json') as f:
        expected_datasets = json.load(f)
        return sorted(expected_datasets, key=lambda d: d['id'])


@pytest.mark.asyncio
@vcr.use_cassette('tests/fixtures/crawler.vcr.yml')
async def test_crawl(expected_crawl_result):
    catalog_url = 'http://localhost:8080/thredds/catalog.xml'
    crawler = TDSCrawler(catalog_url, maxtasks=5)
    datasets = await asyncio.wait_for(crawler.run(), timeout=10)
    sorted_datasets = sorted(datasets, key=lambda d: d['id'])
    assert sorted_datasets == expected_crawl_result

@pytest.mark.asyncio
@vcr.use_cassette('tests/fixtures/crawler2.vcr.yml')
async def test_crawl_notfound():
    catalog_url = 'http://localhost:8888/thredds/catalog.xml'
    crawler = TDSCrawler(catalog_url, maxtasks=5)
    with pytest.raises(CrawlerFetchError) as excinfo:
        await asyncio.wait_for(crawler.run(), timeout=10)
    assert catalog_url in str(excinfo.value)