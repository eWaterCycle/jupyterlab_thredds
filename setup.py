import setuptools
from setupbase import (
    create_cmdclass, ensure_python, find_packages, get_version
    )

data_files_spec = [
    ('etc/jupyter/jupyter_notebook_config.d',
     'jupyter-config/jupyter_notebook_config.d', 'jupyterlab_thredds.json'),
]

cmdclass = create_cmdclass(data_files_spec=data_files_spec)

with open('README.md') as readme_file:
    readme = readme_file.read()

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
    python_requires='>=3.5',
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
    install_requires=[
        'notebook',
        'siphon',
        'xarray>=0.10,<0.10.8',  # pinned due to ipyleaflet py3.4 compatibility
        'ipyleaflet',
        'OWSLib',
        'traitlets',
        'aiohttp',
    ],
    version=get_version('jupyterlab_thredds/version.py'),
    long_description=readme,
    long_description_content_type="text/markdown",
)

try:
    ensure_python(setup_dict["python_requires"].split(','))
except ValueError as e:
    raise ValueError("{:s}, to use {} you must use python {} ".format(
                          e,
                          setup_dict["name"],
                          setup_dict["python_requires"])
                     )

setuptools.setup(**setup_dict)
