from jupyterlab_thredds import ThreddsConfig


def test_ThreddsConfig():
    config = ThreddsConfig(workers=42)
    assert config.workers == 42
