
# 🛠️ 安装

## 选项1：使用 uv（推荐）
```bash
# 克隆 GitHub 仓库
git clone https://github.com/sndraw/bookroom-audio.git

# 进入项目目录
cd bookroom-audio

# 如果你还没有安装 uv，请先安装（可能需要需要设置uv到系统环境变量）
pip install uv

# 创建虚拟环境并安装依赖
# 我们支持使用 Python 3.10、3.11、3.12
uv venv .venv --python=3.10

# 激活虚拟环境
# 对于 macOS/Linux
source .venv/bin/activate
# 对于 Windows
.venv\Scripts\activate

# 安装所有依赖
uv pip install -e .

# 完成后退出虚拟环境
deactivate
```

# 🚀 启动
## **设置环境变量**
在项目根目录下创建一个 `.env` 文件，并添加以下内容：
   
```bash
API_KEY=your_api_key_here
MODEL=medium
DEVICE=cpu # 设备支持：可选，默认为 cpu, 支持cuda
COMPUTE_TYPE=float16
MODEL_KEEP_ALIVE=5m
NUM_WORKERS=2
DOWNLOAD_ROOT=./cache

```
## **启动服务**
```bash
uv run -m bookroom_audio.api.app

```


# Docker打包
### 1.登录镜像仓库（可选）
```bash
docker login -u username <IP:port>/<repository>
```
### 2.构建镜像

#### make命令（参数可选）
注：Makefile中定义了build-push-all目标，可以一次性构建并推送镜像
```bash
make build-push-all REGISTRY_URL=<IP:port>/<repository> IMAGE_NAME=sndraw/bookroom-audio IMAGE_VERISON=0.0.1

#gpu版本（cuda）
make gpu-build-push-all REGISTRY_URL=<IP:port>/<repository> IMAGE_NAME=sndraw/bookroom-audio IMAGE_VERISON=0.0.1
```

