import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
import os
from typing import Any, Optional, Union
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request
from faster_whisper import WhisperModel
from dotenv import load_dotenv, find_dotenv
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from ascii_colors import ASCIIColors
from bookroom_audio.api.utils import (
    get_api_key_dependency,
    parse_args,
    logger,
    parse_keep_alive,
)
from bookroom_audio.api import __api_name__, __api_description__, __api_version__

# 确保环境变量已加载
load_dotenv(find_dotenv(), override=True)


# 创建一个全局锁
global_lock = asyncio.Lock()


async def load_model_task(args: Any, params: dict, task: str):
    model = params.get("model", args.model)
    global model_client
    global model_last_loaded
    if model_client is None:
        logger.info("Model is being loaded...")
        model_last_loaded = datetime.now()
        # 加载Whisper模型,可根据实际情况选择模型大小和设备
        model_client = WhisperModel(
            model_size_or_path=model,
            device=args.device,
            compute_type=args.compute_type,
            num_workers=args.num_workers,
            download_root=args.download_root,
        )
        logger.info("Model has been loaded")
        ASCIIColors.green("\nModel has been loaded\n")
        ASCIIColors.white("    ├─ model_size_or_path: ", end="")
        ASCIIColors.yellow(f"{model}")
        ASCIIColors.white("    ├─ device: ", end="")
        ASCIIColors.yellow(f"{args.device}")
        ASCIIColors.white("    ├─ compute_type: ", end="")
        ASCIIColors.yellow(f"{args.compute_type}")
        ASCIIColors.white("    ├─ num_workers: ", end="")
        ASCIIColors.yellow(f"{args.num_workers}")
        ASCIIColors.white("    ├─ download_root: ", end="")
        ASCIIColors.yellow(f"{args.download_root}")
        # 获取上传的音频文件
    audio_content = params.get("file")
    language = params.get("language", "en")
    # 这里需要将audio_content转换成适合Whisper模型输入的格式，
    ASCIIColors.green("\nTranscribing audio...\n")
    ASCIIColors.white("    ├─ task: ", end="")
    ASCIIColors.yellow(f"{task}")
    ASCIIColors.white("    ├─ language: ", end="")
    ASCIIColors.yellow(f"{language}")
    result, _ = model_client.transcribe(
        audio=audio_content, task=task, language=language
    )
    model_last_loaded = datetime.now()
    return result


async def cleanup_model():
    global model_client  # 再次声明以允许在函数内修改
    global model_last_loaded
    if model_client is not None:
        logger.info("Cleaning up model...")
        # 调用清理方法，待实现
        # model_client.cleanup()
        model_client = None
        model_last_loaded = None
        logger.info("Model has been cleaned up")


async def run_model_loaded_process(args: Any):
    """Run the model loaded process in a background task"""
    while True:
        keep_alive = parse_keep_alive(args.model_keep_alive)
        try:
            await asyncio.sleep(60)  # 默认每1分钟扫描一次
            # 判定上次loaded模型时间是否超过keep_alive时间
            if (
                model_client is not None
                and (datetime.now() - model_last_loaded).total_seconds() > keep_alive
            ):
                logger.info("Model has been loaded for too long, unloading...")
                await cleanup_model()
        except asyncio.CancelledError:
            print("Task was cancelled")
            break  # 任务被取消后退出循环

        except Exception as e:
            print(f"An error occurred: {e}")
            break  # 出现错误后退出循环


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    global model_client
    # Store background tasks
    app.state.background_tasks = set()
    try:
        async with global_lock:
            task = asyncio.create_task(run_model_loaded_process(args))
            task.add_done_callback(app.state.background_tasks.discard)
            logger.info(f"Process {os.getpid()} auto scan task started at startup.")
        ASCIIColors.green("\nServer is ready to accept connections! 🚀\n")
        yield
    finally:
        async with global_lock:
            # 取消所有后台任务
            for task in app.state.background_tasks:
                task.cancel()
        ASCIIColors.green("\nServer is shutting down! 🛑\n")
        # 在应用关闭时清理模型
        await cleanup_model()


def get_cors_origins():
    """Get allowed origins from environment variable
    Returns a list of allowed origins, defaults to ["*"] if not set
    """
    origins_str = os.getenv("CORS_ORIGINS", "*")
    if origins_str == "*":
        return ["*"]
    return [origin.strip() for origin in origins_str.split(",")]


args = parse_args()

app = FastAPI(
    title=__api_name__,
    description=__api_description__,
    version=__api_version__,
    openapi_url="/openapi.json",  # Explicitly set OpenAPI schema URL
    docs_url="/docs",  # Explicitly set docs URL
    redoc_url="/redoc",  # Explicitly set redoc URL
    openapi_tags=[{"name": "api"}],
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = args.key
# Create the optional API key dependency
optional_api_key = get_api_key_dependency(api_key)
model_client: Optional[WhisperModel] = None


@app.post("/v1/audio/translations", dependencies=[Depends(optional_api_key)])
async def translate_audio(request: Request):
    try:
        data = await request.form()
        result = await load_model_task(args, data, task="translate")
        return result
    except asyncio.CancelledError:
        return {"error": "Request cancelled"}, 499  # 使用499状态码表示客户端中止请求
    except Exception as e:
        logger.error(f"Error during transcriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/audio/transcriptions", dependencies=[Depends(optional_api_key)])
async def transcribe_audio(request: Request):
    try:
        data = await request.form()
        result = await load_model_task(args, data, task="transcribe")
        return result
    except asyncio.CancelledError:
        return {"error": "Request cancelled"}, 499  # 使用499状态码表示客户端中止请求
    except Exception as e:
        logger.error(f"Error during transcriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def main():
    import uvicorn

    app.add_event_handler("startup", cleanup_model)
    uvicorn.run(
        "bookroom_audio.api.app:app",
        host=args.host,
        port=args.port,
        workers=args.workers,
        reload=args.reload,
    )


# 如果直接运行此脚本，则启动Uvicorn服务器
if __name__ == "__main__":
    main()
