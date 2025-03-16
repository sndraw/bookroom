import logging
import os
from typing import Optional, Union
from fastapi import Depends, FastAPI, HTTPException, Request, UploadFile, File
from faster_whisper import WhisperModel
from dotenv import load_dotenv, find_dotenv
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from api.utils import get_api_key_dependency, parse_args

# 确保环境变量已加载
load_dotenv(find_dotenv(), override=True)


args = parse_args()

app = FastAPI()


def get_cors_origins():
    """Get allowed origins from environment variable
    Returns a list of allowed origins, defaults to ["*"] if not set
    """
    origins_str = os.getenv("CORS_ORIGINS", "*")
    if origins_str == "*":
        return ["*"]
    return [origin.strip() for origin in origins_str.split(",")]


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 加载Whisper模型,可根据实际情况选择模型大小和设备
model = WhisperModel(
    args.model_size, device=args.device, compute_type=args.compute_type
)
api_key = args.key
# Create the optional API key dependency
optional_api_key = get_api_key_dependency(api_key)


class AudioRequest(BaseModel):
    file: UploadFile = File(..., description="The audio file to transcribe")
    model: Optional[str] = Field(None, description="The model to use for transcription")
    language: Optional[str] = Field("en", description="The language of the audio")


@app.post("/v1/audio/transcriptions", dependencies=[Depends(optional_api_key)])
async def transcriptions_audio(request: Request):
    try:
        data = await request.form()
        # 获取上传的音频文件
        audio_content = data.get("file")
        language = data.get("language")

        # # 这里需要将audio_content转换成适合Whisper模型输入的格式，
        # # 具体取决于您使用的Whisper实现。以下是假设性的示例：
        result, _ = model.transcribe(audio_content, language=language)
        return {"success": True, "transcriptions": result}
    except Exception as e:
        logging.error(f"Error during transcriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 如果直接运行此脚本，则启动Uvicorn服务器
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host=args.host,
        port=args.port,
        workers=args.workers,
        reload=args.reload,
    )
