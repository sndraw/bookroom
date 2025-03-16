import argparse
import os
from typing import Optional

from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
from starlette.status import HTTP_403_FORBIDDEN


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
        "--model-size",
        type=str,
        default=os.getenv("MODEL_SIZE", "medium"),
        help="Size of the Whisper model to use (default: medium).",
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
            raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Invalid Authorization header format")

        if api_key_header_value != api_key:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN, detail="Invalid API Key"
            )
        return api_key_header_value

    return api_key_auth
