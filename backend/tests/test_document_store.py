from pathlib import Path

from backend.auth import create_user
from backend.db import init_db
from backend.document_store import get_document, list_documents, save_document


def test_save_document_and_get_it_back(tmp_path: Path) -> None:
    db_path = tmp_path / "test.db"
    init_db(db_path)
    user = create_user("a@example.com", "correct horse battery staple", db_path)

    saved = save_document(
        user.id, "mutual_nda", "Acme, Inc. and Globex Corp.", {"purpose": "Evaluating a partnership."}, db_path
    )

    doc = get_document(saved.id, user.id, db_path)
    assert doc is not None
    assert doc.document_type == "mutual_nda"
    assert doc.title == "Acme, Inc. and Globex Corp."
    assert doc.fields == {"purpose": "Evaluating a partnership."}


def test_get_document_returns_none_for_another_users_document(tmp_path: Path) -> None:
    db_path = tmp_path / "test.db"
    init_db(db_path)
    owner = create_user("owner@example.com", "correct horse battery staple", db_path)
    other = create_user("other@example.com", "correct horse battery staple", db_path)
    saved = save_document(owner.id, "mutual_nda", "Acme, Inc.", {}, db_path)

    assert get_document(saved.id, other.id, db_path) is None


def test_list_documents_returns_only_the_users_own_documents_newest_first(tmp_path: Path) -> None:
    db_path = tmp_path / "test.db"
    init_db(db_path)
    owner = create_user("owner@example.com", "correct horse battery staple", db_path)
    other = create_user("other@example.com", "correct horse battery staple", db_path)
    save_document(other.id, "pilot_agreement", "Not mine", {}, db_path)
    first = save_document(owner.id, "mutual_nda", "First", {}, db_path)
    second = save_document(owner.id, "pilot_agreement", "Second", {}, db_path)

    summaries = list_documents(owner.id, db_path)

    assert [s.id for s in summaries] == [second.id, first.id]
    assert all(s.title != "Not mine" for s in summaries)
