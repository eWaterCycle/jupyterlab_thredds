from typing import List

from siphon.catalog import TDSCatalog, Dataset


def crawl(catalog_url: str):
    catalog = TDSCatalog(catalog_url)
    return [ds2json(ds) for ds in traverse_catalog(catalog)]


def traverse_catalog(catalog: TDSCatalog) -> List[Dataset]:
    for dataset in sorted(catalog.datasets.values(), key=lambda d: d.url_path):
        yield dataset
    for cat in sorted(catalog.catalog_refs.values(), key=lambda c: c.href):
        yield from traverse_catalog(cat.follow())


def ds2json(dataset: Dataset):
    services = {k.upper(): v for k, v in dataset.access_urls.items()}
    return {
        'name': dataset.name,
        'id': dataset.url_path,
        'services': services
    }
