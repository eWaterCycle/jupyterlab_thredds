from traitlets import Integer
from traitlets.config import Configurable


class ThreddsConfig(Configurable):
    """
    Configuration of THREDDS catalog crawler

    """
    maxtasks = Integer(10, config=True, help='Number of download tasks to run concurrently')
    timeout = Integer(600, config=True, help='Maximum number of seconds to perform crawl')
