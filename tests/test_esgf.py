import json

import pytest
from tornado.httputil import url_concat
from tornado.web import Application
import vcr

from jupyterlab_thredds.fetchers.esgf import esgf_handler


@pytest.fixture
def app():
    return Application([esgf_handler()])


@pytest.mark.gen_test
@vcr.use_cassette('tests/fixtures/esgf.vcr.yml', ignore_localhost=True)
async def test_search(http_client, base_url):
    catalog_url = 'https://esgf-node.llnl.gov/esg-search/search'
    query = 'project:CMIP6 AND variable:tas AND frequency:mon AND experiment_id:historical AND member_id:r1i1p1f1'

    params = {
        'catalog_url': catalog_url,
        'query': query,
    }
    url = url_concat(base_url + '/esgf', params)

    response = await http_client.fetch(url)

    results = json.loads(response.body.decode('utf-8'))
    assert len(results) == 211
    expected_first_result = {
        'id': 'CMIP6.CMIP.BCC.BCC-CSM2-MR.historical.r1i1p1f1.Amon.tas.gn.v20181126.tas_Amon_BCC-CSM2-MR_historical_r1i1p1f1_gn_185001-201412.nc|cmip.bcc.cma.cn',
        'name': 'tas_Amon_BCC-CSM2-MR_historical_r1i1p1f1_gn_185001-201412.nc',
        'services': {
            'Globus': 'globus:90282ada-ddac-11e8-8c90-0a1d4c5c824a/cmip6_data/CMIP/BCC/BCC-CSM2-MR/historical/r1i1p1f1/Amon/tas/gn/v20181126/tas_Amon_BCC-CSM2-MR_historical_r1i1p1f1_gn_185001-201412.nc',
            'GridFTP': 'gsiftp://cmip.bcc.cma.cn:2811//cmip6_data/CMIP/BCC/BCC-CSM2-MR/historical/r1i1p1f1/Amon/tas/gn/v20181126/tas_Amon_BCC-CSM2-MR_historical_r1i1p1f1_gn_185001-201412.nc',
            'HTTPServer': 'http://cmip.bcc.cma.cn/thredds/fileServer/cmip6_data/CMIP/BCC/BCC-CSM2-MR/historical/r1i1p1f1/Amon/tas/gn/v20181126/tas_Amon_BCC-CSM2-MR_historical_r1i1p1f1_gn_185001-201412.nc',
            'OPENDAP': 'http://cmip.bcc.cma.cn/thredds/dodsC/cmip6_data/CMIP/BCC/BCC-CSM2-MR/historical/r1i1p1f1/Amon/tas/gn/v20181126/tas_Amon_BCC-CSM2-MR_historical_r1i1p1f1_gn_185001-201412.nc',
        }
    }
    assert results[0] == expected_first_result
