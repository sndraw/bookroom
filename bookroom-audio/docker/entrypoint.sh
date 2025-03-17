#!/bin/bash

cd /app

# 激活虚拟环境
source .venv/bin/activate

# 运行应用
uv run -m bookroom_audio.api.app 