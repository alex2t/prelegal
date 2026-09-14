"""FastAPI application entrypoint."""

import secrets
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.middleware.sessions import SessionMiddleware

from backend import auth, document_store
from backend.chat import ChatRequest, ChatResponse, run_chat
from backend.db import init_db

load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

# The session cookie only needs to survive as long as the (temporary,
# recreated-on-restart) database does, so a fresh secret per process start
# is fine - it just means every restart also signs everyone out.
app.add_middleware(SessionMiddleware, secret_key=secrets.token_hex(32))


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat")
def chat(request: ChatRequest) -> ChatResponse:
    try:
        return run_chat(request)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI chat is unavailable right now.") from exc


class Credentials(BaseModel):
    email: str
    password: str


class SaveDocumentRequest(BaseModel):
    document_type: str
    title: str
    fields: dict


def require_user(request: Request) -> auth.User:
    user_id = request.session.get("user_id")
    user = auth.get_user_by_id(user_id) if user_id is not None else None
    if user is None:
        raise HTTPException(status_code=401, detail="Not signed in.")
    return user


@app.post("/api/signup")
def signup(request: Credentials, http_request: Request) -> dict[str, str]:
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    try:
        user = auth.create_user(request.email, request.password)
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=409, detail="An account with that email already exists.") from exc
    http_request.session["user_id"] = user.id
    return {"email": user.email}


@app.post("/api/signin")
def signin(request: Credentials, http_request: Request) -> dict[str, str]:
    found = auth.get_user_by_email(request.email)
    if found is None or not auth.verify_password(request.password, found[1]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    user, _password_hash = found
    http_request.session["user_id"] = user.id
    return {"email": user.email}


@app.post("/api/signout")
def signout(http_request: Request) -> dict[str, bool]:
    http_request.session.clear()
    return {"ok": True}


@app.get("/api/me")
def me(user: auth.User = Depends(require_user)) -> dict[str, str]:
    return {"email": user.email}


@app.post("/api/documents")
def save_document(
    request: SaveDocumentRequest, user: auth.User = Depends(require_user)
) -> document_store.SavedDocumentSummary:
    return document_store.save_document(user.id, request.document_type, request.title, request.fields)


@app.get("/api/documents")
def list_documents(user: auth.User = Depends(require_user)) -> list[document_store.SavedDocumentSummary]:
    return document_store.list_documents(user.id)


@app.get("/api/documents/{document_id}")
def get_document(document_id: int, user: auth.User = Depends(require_user)) -> document_store.SavedDocument:
    doc = document_store.get_document(document_id, user.id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc


if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
