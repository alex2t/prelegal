"""FastAPI application entrypoint."""

from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from backend.chat import ChatRequest, ChatResponse, run_chat
from backend.db import init_db

load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat")
def chat(request: ChatRequest) -> ChatResponse:
    try:
        return run_chat(request)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI chat is unavailable right now.") from exc


if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
