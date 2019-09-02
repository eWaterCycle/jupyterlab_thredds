import asyncio
import json

import pytest
import vcr

from jupyterlab_thredds.crawler import TDSCrawler


@pytest.fixture
def expected_crawl_result():
    with open('tests/fixtures/crawler.expected.json') as f:
        expected_datasets = json.load(f)
        return expected_datasets


@pytest.mark.asyncio
@vcr.use_cassette('tests/fixtures/crawler.vcr.yml')
async def test_crawl(event_loop, expected_crawl_result):
    catalog_url = 'http://localhost:8080/thredds/catalog.xml'
    crawler = TDSCrawler(catalog_url, event_loop, maxtasks=5)
    datasets = await asyncio.wait_for(crawler.run(), timeout=10)
    assert sorted(datasets, key=lambda d: d['id']) == expected_crawl_result
