from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from pydantic import BaseModel

from backend.chat import _RouterTurn
from backend.documents.design_partner import DesignPartnerChatTurn, DesignPartnerFields
from backend.documents.nda import NdaChatTurn, NdaFields
from backend.main import app


def _mock_completion(turn: BaseModel) -> MagicMock:
    response = MagicMock()
    response.choices[0].message.content = turn.model_dump_json()
    return response


def test_chat_routes_to_mutual_nda_and_fills_fields() -> None:
    router_turn = _RouterTurn(reply="Sure, let's set up your NDA.", document_type="mutual_nda")
    fields = NdaFields(party1={"company": "Acme, Inc."})
    filler_turn = NdaChatTurn(reply="Got it. Who is the second party?", fields=fields)

    with patch(
        "backend.chat.completion",
        side_effect=[_mock_completion(router_turn), _mock_completion(filler_turn)],
    ) as mock_completion:
        with TestClient(app) as client:
            response = client.post(
                "/api/chat",
                json={"messages": [{"role": "user", "content": "I need an NDA with Acme, Inc."}]},
            )

    assert response.status_code == 200
    body = response.json()
    assert body["document_type"] == "mutual_nda"
    assert body["reply"] == "Got it. Who is the second party?"
    assert body["fields"]["party1"]["company"] == "Acme, Inc."
    assert mock_completion.call_count == 2


def test_chat_routes_to_design_partner_and_fills_fields() -> None:
    router_turn = _RouterTurn(
        reply="Sure, let's set up your Design Partner Agreement.",
        document_type="design_partner_agreement",
    )
    fields = DesignPartnerFields(provider="Acme, Inc.")
    filler_turn = DesignPartnerChatTurn(reply="Got it. Who is the partner?", fields=fields)

    with patch(
        "backend.chat.completion",
        side_effect=[_mock_completion(router_turn), _mock_completion(filler_turn)],
    ):
        with TestClient(app) as client:
            response = client.post(
                "/api/chat",
                json={"messages": [{"role": "user", "content": "I want a design partner agreement"}]},
            )

    assert response.status_code == 200
    body = response.json()
    assert body["document_type"] == "design_partner_agreement"
    assert body["fields"]["provider"] == "Acme, Inc."


def test_chat_stays_undecided_when_the_router_is_unsure() -> None:
    router_turn = _RouterTurn(reply="What kind of agreement do you need?", document_type="undecided")

    with patch("backend.chat.completion", return_value=_mock_completion(router_turn)):
        with TestClient(app) as client:
            response = client.post(
                "/api/chat",
                json={"messages": [{"role": "user", "content": "Hi"}]},
            )

    assert response.status_code == 200
    body = response.json()
    assert body["document_type"] is None
    assert body["fields"] == {}
    assert body["reply"] == "What kind of agreement do you need?"


def test_chat_skips_the_router_once_document_type_is_known() -> None:
    fields = NdaFields(party1={"company": "Acme, Inc."}, party2={"company": "Globex Corp."})
    filler_turn = NdaChatTurn(reply="Thanks!", fields=fields)

    with patch("backend.chat.completion", return_value=_mock_completion(filler_turn)) as mock_completion:
        with TestClient(app) as client:
            response = client.post(
                "/api/chat",
                json={
                    "messages": [{"role": "user", "content": "Globex Corp. is the other party."}],
                    "document_type": "mutual_nda",
                    "fields": NdaFields(party1={"company": "Acme, Inc."}).model_dump(),
                },
            )

    assert response.status_code == 200
    assert response.json()["document_type"] == "mutual_nda"
    mock_completion.assert_called_once()


def test_chat_returns_502_when_the_llm_call_fails() -> None:
    with patch("backend.chat.completion", side_effect=RuntimeError("boom")):
        with TestClient(app) as client:
            response = client.post("/api/chat", json={"messages": []})

    assert response.status_code == 502
