import json
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from backend.chat import ChatResponse, NdaFields
from backend.main import app


def _mock_completion(reply: str, fields: NdaFields) -> MagicMock:
    response = MagicMock()
    response.choices[0].message.content = ChatResponse(reply=reply, fields=fields).model_dump_json()
    return response


def test_chat_returns_the_models_reply_and_fields() -> None:
    fields = NdaFields(party1={"company": "Acme, Inc."}, purpose="Evaluating a partnership.")
    mock_response = _mock_completion("Got it. Who is the second party?", fields)

    with patch("backend.chat.completion", return_value=mock_response) as mock_completion:
        with TestClient(app) as client:
            response = client.post(
                "/api/chat",
                json={
                    "messages": [{"role": "user", "content": "Acme, Inc. wants to evaluate a partnership."}],
                    "fields": NdaFields().model_dump(),
                },
            )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "Got it. Who is the second party?"
    assert body["fields"]["party1"]["company"] == "Acme, Inc."
    assert body["fields"]["purpose"] == "Evaluating a partnership."

    call_kwargs = mock_completion.call_args.kwargs
    assert call_kwargs["response_format"] is ChatResponse
    assert call_kwargs["messages"][0]["role"] == "system"
    assert call_kwargs["messages"][-1] == {
        "role": "user",
        "content": "Acme, Inc. wants to evaluate a partnership.",
    }


def test_chat_sends_current_known_fields_to_the_model() -> None:
    fields = NdaFields(party1={"company": "Acme, Inc."})
    mock_response = _mock_completion("Thanks!", fields)

    with patch("backend.chat.completion", return_value=mock_response) as mock_completion:
        with TestClient(app) as client:
            client.post(
                "/api/chat",
                json={"messages": [], "fields": fields.model_dump()},
            )

    system_message = mock_completion.call_args.kwargs["messages"][0]["content"]
    assert "Acme, Inc." in system_message


def test_chat_returns_502_when_the_llm_call_fails() -> None:
    with patch("backend.chat.completion", side_effect=RuntimeError("boom")):
        with TestClient(app) as client:
            response = client.post(
                "/api/chat",
                json={"messages": [], "fields": NdaFields().model_dump()},
            )

    assert response.status_code == 502
