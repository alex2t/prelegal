"""Persistence for previously generated documents.

Named separately from the `documents/` package (which holds the AI chat's
per-template field schemas) to avoid a name collision.
"""

import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path

from backend.db import DB_PATH


@dataclass(frozen=True)
class SavedDocumentSummary:
    id: int
    document_type: str
    title: str
    created_at: str


@dataclass(frozen=True)
class SavedDocument:
    id: int
    document_type: str
    title: str
    created_at: str
    fields: dict


def save_document(
    user_id: int, document_type: str, title: str, fields: dict, db_path: Path = DB_PATH
) -> SavedDocumentSummary:
    connection = sqlite3.connect(db_path)
    try:
        cursor = connection.execute(
            "INSERT INTO documents (user_id, document_type, title, fields) VALUES (?, ?, ?, ?)",
            (user_id, document_type, title, json.dumps(fields)),
        )
        connection.commit()
        created_at = connection.execute(
            "SELECT created_at FROM documents WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()[0]
    finally:
        connection.close()
    return SavedDocumentSummary(id=cursor.lastrowid, document_type=document_type, title=title, created_at=created_at)


def list_documents(user_id: int, db_path: Path = DB_PATH) -> list[SavedDocumentSummary]:
    connection = sqlite3.connect(db_path)
    try:
        rows = connection.execute(
            "SELECT id, document_type, title, created_at FROM documents "
            # `id DESC` breaks ties deterministically since `created_at` only
            # has second-level resolution - two documents saved within the
            # same second would otherwise sort arbitrarily.
            "WHERE user_id = ? ORDER BY created_at DESC, id DESC",
            (user_id,),
        ).fetchall()
    finally:
        connection.close()
    return [SavedDocumentSummary(id=row[0], document_type=row[1], title=row[2], created_at=row[3]) for row in rows]


def get_document(document_id: int, user_id: int, db_path: Path = DB_PATH) -> SavedDocument | None:
    connection = sqlite3.connect(db_path)
    try:
        row = connection.execute(
            "SELECT id, document_type, title, fields, created_at FROM documents "
            "WHERE id = ? AND user_id = ?",
            (document_id, user_id),
        ).fetchone()
    finally:
        connection.close()
    if row is None:
        return None
    return SavedDocument(id=row[0], document_type=row[1], title=row[2], fields=json.loads(row[3]), created_at=row[4])
