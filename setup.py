import setuptools
from setupbase import (
    create_cmdclass, ensure_python, find_packages, get_version
    )

data_files_spec = [
    ('etc/jupyter/jupyter_notebook_config.d',
     'jupyter-config/jupyter_notebook_config.d', 'jupyterlab_thredds.json'),
]

cmdclass = create_cmdclass(data_files_spec=data_files_spec)

setup_dict = dict(
    name='jupyterlab_thredds',
    url='https://github.com/eWaterCycle/jupyterlab_thredds',
    author='S. Verhoeven',
    author_email='s.verhoeven@esciencecenter.nl',
    description='A Jupyter Notebook server extension which crawls a thredds catalog',
    packages=find_packages(),
    cmdclass=cmdclass,
    platforms="Linux, Mac OS X, Windows",
    keywords=['Jupyter', 'JupyterLab', 'Thredds'],
    python_requires = '>=3.5',
    license='Apache-2.0',
    classifiers=[
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Intended Audience :: Science/Research',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'License :: OSI Approved :: Apache Software License',
    ],
    install_requires=['notebook', 'thredds_crawler', 'xarray', 'ipyleaflet', 'OWSLib', 'traitlets'],
    version=get_version('jupyterlab_thredds/version.py'),
)

try:
    ensure_python(setup_dict["python_requires"].split(','))
except ValueError as e:
    raise  ValueError("{:s}, to use {} you must use python {} ".format(
                          e,
                          setup_dict["name"],
                          setup_dict["python_requires"])
                     )

setuptools.setup(**setup_dict)