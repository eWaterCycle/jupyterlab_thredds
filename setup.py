import setuptools

data_files_spec = [
    ('etc/jupyter/jupyter_notebook_config.d',
     'jupyter-config/jupyter_notebook_config.d', 'jupyterlab_thredds.json'),
]

exec(open('jupyterlab_thredds/version.py').read())

setup_dict = dict(
    name='jupyterlab_thredds',
    description='A Jupyter Notebook server extension which crawls a thredds catalog',
    packages=setuptools.find_packages(),
    platforms="Linux, Mac OS X, Windows",
    keywords=['Jupyter', 'JupyterLab', 'Thredds'],
    classifiers=[
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Intended Audience :: Science/Research',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
    ],
    install_requires=['notebook', 'thredds_crawler', 'xarray', 'ipyleaflet', 'OWSLib', 'traitlets']
)

setuptools.setup(version=__version__, **setup_dict)
