import sqlite3
from pathlib import Path

import pytest

from backend.auth import create_user, get_user_by_email, get_user_by_id, hash_password, verify_password
from backend.db import init_db


def test_hash_password_does_not_store_plaintext() -> None:
    password_hash = hash_password("correct horse battery staple")
    assert password_hash != "correct horse battery staple"


def test_verify_password_accepts_the_right_password_and_rejects_others() -> None:
    password_hash = hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", password_hash) is True
    assert verify_password("wrong password", password_hash) is False


def test_create_user_persists_a_hashed_password(tmp_path: Path) -> None:
    db_path = tmp_path / "test.db"
    init_db(db_path)

    user = create_user("a@example.com", "correct horse battery staple", db_path)

    assert user.email == "a@example.com"
    found = get_user_by_email("a@example.com", db_path)
    assert found is not None
    found_user, password_hash = found
    assert found_user.id == user.id
    assert verify_password("correct horse battery staple", password_hash)


def test_create_user_rejects_a_duplicate_email(tmp_path: Path) -> None:
    db_path = tmp_path / "test.db"
    init_db(db_path)
    create_user("a@example.com", "correct horse battery staple", db_path)

    with pytest.raises(sqlite3.IntegrityError):
        create_user("a@example.com", "a different password", db_path)


def test_get_user_by_email_returns_none_when_not_found(tmp_path: Path) -> None:
    db_path = tmp_path / "test.db"
    init_db(db_path)

    assert get_user_by_email("nobody@example.com", db_path) is None


def test_get_user_by_id_round_trips(tmp_path: Path) -> None:
    db_path = tmp_path / "test.db"
    init_db(db_path)
    created = create_user("a@example.com", "correct horse battery staple", db_path)

    found = get_user_by_id(created.id, db_path)

    assert found is not None
    assert found.email == "a@example.com"


def test_get_user_by_id_returns_none_when_not_found(tmp_path: Path) -> None:
    db_path = tmp_path / "test.db"
    init_db(db_path)

    assert get_user_by_id(999, db_path) is None
