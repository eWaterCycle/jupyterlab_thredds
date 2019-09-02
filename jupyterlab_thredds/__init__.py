from .fetchers.thredds import thredds_handler
from .fetchers.esgf import esgf_handler


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
    handlers = [
        thredds_handler(base_url), 
        esgf_handler(base_url),
    ]
    web_app.add_handlers('.*$', handlers)
