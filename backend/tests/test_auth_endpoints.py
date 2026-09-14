from fastapi.testclient import TestClient

from backend.main import app


def test_signup_then_me_returns_the_new_user() -> None:
    with TestClient(app) as client:
        signup_response = client.post(
            "/api/signup", json={"email": "a@example.com", "password": "correct horse"}
        )
        me_response = client.get("/api/me")

    assert signup_response.status_code == 200
    assert signup_response.json() == {"email": "a@example.com"}
    assert me_response.status_code == 200
    assert me_response.json() == {"email": "a@example.com"}


def test_signup_rejects_a_short_password() -> None:
    with TestClient(app) as client:
        response = client.post("/api/signup", json={"email": "a@example.com", "password": "short"})

    assert response.status_code == 400


def test_signup_rejects_a_duplicate_email() -> None:
    with TestClient(app) as client:
        client.post("/api/signup", json={"email": "a@example.com", "password": "correct horse"})
        response = client.post("/api/signup", json={"email": "a@example.com", "password": "another password"})

    assert response.status_code == 409


def test_me_requires_a_session() -> None:
    with TestClient(app) as client:
        response = client.get("/api/me")

    assert response.status_code == 401


def test_signin_with_the_right_password_starts_a_session() -> None:
    with TestClient(app) as client:
        client.post("/api/signup", json={"email": "a@example.com", "password": "correct horse"})
        # Entering a fresh `with TestClient(app)` block re-runs the app's
        # lifespan (wiping the database), so simulating a second, unrelated
        # browser session against the same seeded data means clearing
        # cookies within one block rather than opening a second one.
        client.cookies.clear()

        signin_response = client.post(
            "/api/signin", json={"email": "a@example.com", "password": "correct horse"}
        )
        me_response = client.get("/api/me")

    assert signin_response.status_code == 200
    assert me_response.status_code == 200


def test_signin_rejects_the_wrong_password() -> None:
    with TestClient(app) as client:
        client.post("/api/signup", json={"email": "a@example.com", "password": "correct horse"})
        response = client.post("/api/signin", json={"email": "a@example.com", "password": "wrong password"})

    assert response.status_code == 401


def test_signout_clears_the_session() -> None:
    with TestClient(app) as client:
        client.post("/api/signup", json={"email": "a@example.com", "password": "correct horse"})
        client.post("/api/signout")
        response = client.get("/api/me")

    assert response.status_code == 401


def test_documents_require_a_session() -> None:
    with TestClient(app) as client:
        response = client.get("/api/documents")

    assert response.status_code == 401


def test_save_list_and_get_a_document() -> None:
    with TestClient(app) as client:
        client.post("/api/signup", json={"email": "a@example.com", "password": "correct horse"})

        save_response = client.post(
            "/api/documents",
            json={
                "document_type": "mutual_nda",
                "title": "Acme, Inc. and Globex Corp.",
                "fields": {"purpose": "Evaluating a partnership."},
            },
        )
        list_response = client.get("/api/documents")
        document_id = save_response.json()["id"]
        get_response = client.get(f"/api/documents/{document_id}")

    assert save_response.status_code == 200
    assert list_response.status_code == 200
    assert list_response.json() == [
        {
            "id": document_id,
            "document_type": "mutual_nda",
            "title": "Acme, Inc. and Globex Corp.",
            "created_at": save_response.json()["created_at"],
        }
    ]
    assert get_response.status_code == 200
    assert get_response.json()["fields"] == {"purpose": "Evaluating a partnership."}


def test_get_document_404s_for_another_users_document() -> None:
    with TestClient(app) as client:
        client.post("/api/signup", json={"email": "owner@example.com", "password": "correct horse"})
        save_response = client.post(
            "/api/documents", json={"document_type": "mutual_nda", "title": "Owner's doc", "fields": {}}
        )
        document_id = save_response.json()["id"]

        client.cookies.clear()
        client.post("/api/signup", json={"email": "other@example.com", "password": "correct horse"})
        response = client.get(f"/api/documents/{document_id}")

    assert response.status_code == 404
