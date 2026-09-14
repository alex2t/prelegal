"""Password hashing and user account persistence."""

import sqlite3
from dataclasses import dataclass
from pathlib import Path

import bcrypt

from backend.db import DB_PATH


@dataclass(frozen=True)
class User:
    id: int
    email: str


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_user(email: str, password: str, db_path: Path = DB_PATH) -> User:
    """Raises sqlite3.IntegrityError if the email is already registered."""
    connection = sqlite3.connect(db_path)
    try:
        cursor = connection.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email, hash_password(password)),
        )
        connection.commit()
        return User(id=cursor.lastrowid, email=email)
    finally:
        connection.close()


def get_user_by_email(email: str, db_path: Path = DB_PATH) -> tuple[User, str] | None:
    """Returns (user, password_hash), or None if no user has this email."""
    connection = sqlite3.connect(db_path)
    try:
        row = connection.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?", (email,)
        ).fetchone()
    finally:
        connection.close()
    if row is None:
        return None
    return User(id=row[0], email=row[1]), row[2]


def get_user_by_id(user_id: int, db_path: Path = DB_PATH) -> User | None:
    connection = sqlite3.connect(db_path)
    try:
        row = connection.execute("SELECT id, email FROM users WHERE id = ?", (user_id,)).fetchone()
    finally:
        connection.close()
    if row is None:
        return None
    return User(id=row[0], email=row[1])
