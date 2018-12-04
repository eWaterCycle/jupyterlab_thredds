from jupyterlab_thredds import ThreddsConfig


def test_ThreddsConfig():
    config = ThreddsConfig(maxtasks=42, timeout=123)
    assert config.maxtasks == 42 and config.timeout == 123
