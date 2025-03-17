import argparse
import logging
import os
from typing import Optional

from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
from starlette.status import HTTP_403_FORBIDDEN
from bookroom_audio.api import __api_name__

logger = logging.getLogger(__api_name__)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Transcribe audio using Whisper model."
    )
    parser.add_argument(
        "--key",
        type=str,
        default=os.getenv("API_KEY", None),
        help="API key for authentication. This protects lightrag server against unauthorized access",
    )

    parser.add_argument(
        "--model",
        type=str,
        default=os.getenv("MODEL", "medium"),
        help="Size or path of the Whisper model to use (default: medium).",
    )
    parser.add_argument(
        "--model-keep-alive",
        type=str,
        default=os.getenv("MODEL_KEEP_ALIVE", "5m"),
        help="How long to keep the model in memory before unloading it (default: 5m).",
    )
    parser.add_argument(
        "--device",
        type=str,
        default=os.getenv("DEVICE", "cpu"),
        help="Device to run the model on (default: cpu).",
    )
    parser.add_argument(
        "--compute-type",
        type=str,
        default=os.getenv("MODEL_SIZE", "int8"),
        help="Compute type for the model (default: int8).",
    )
    parser.add_argument(
        "--num-workers",
        type=int,
        default=os.getenv("NUM_WORKERS", 1),
        help="Number workders for the model (default: 1).",
    )
    parser.add_argument(
        "--download-root",
        type=str,
        default=os.getenv("DOWNLOAD_ROOT", "./.cache"),
        help="Download workders for the model (default: ./.cache).",
    )
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host to run the server on (default: 0.0.0.0).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=15231,
        help="Port to run the server on (default: 15231).",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=2,
        help="Number of workers to use for transcription (default:1).",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Reload the model on every request (default: False).",
    )
    args = parser.parse_args()
    return args


def get_api_key_dependency(api_key: Optional[str]):
    """
    Create an API key dependency for route protection.

    Args:
        api_key (Optional[str]): The API key to validate against.
                                If None, no authentication is required.

    Returns:
        Callable: A dependency function that validates the API key.
    """
    if not api_key:
        # If no API key is configured, return a dummy dependency that always succeeds
        async def no_auth():
            return None

        return no_auth

    # If API key is configured, use proper authentication
    api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

    async def api_key_auth(
        api_key_header_value: Optional[str] = Security(api_key_header),
    ):
        if not api_key_header_value:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN, detail="API Key required"
            )

        if api_key_header_value.startswith("Bearer "):
            api_key_header_value = api_key_header_value.split(" ")[1]
        else:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN,
                detail="Invalid Authorization header format",
            )

        if api_key_header_value != api_key:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN, detail="Invalid API Key"
            )
        return api_key_header_value

    return api_key_auth


def parse_keep_alive(keep_alive):
    if "m" in keep_alive:
        return int(keep_alive[:-1]) * 60
    elif "h" in keep_alive:
        return int(keep_alive[:-1]) * 3600
    else:
        raise ValueError("Invalid format for keep_alive. Expected '5m' or '5h'.")
