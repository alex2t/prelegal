# prelegal

An AI-assisted SaaS for drafting legal agreements from [Common Paper](https://commonpaper.com) templates.

## What it does

Sign up, then chat with an AI to draft any of the 11 documents listed in `catalog.json` (Mutual NDA, Design Partner Agreement, Cloud Service Agreement, Service Level Agreement, Professional Services Agreement, Data Processing Agreement, Software License Agreement, Partnership Agreement, Business Associate Agreement, Pilot Agreement, AI Addendum). The AI figures out which document you want and fills in its fields conversationally. Review the generated document, download it as a PDF, and find it later under "My Documents".

Every generated document carries a disclaimer: it's an AI-drafted **draft**, not reviewed by an attorney.

## Stack

- **Backend**: FastAPI + uv, SQLite (recreated from scratch on every restart)
- **Frontend**: Next.js, statically exported and served by the backend on port 8000
- **AI**: LiteLLM via OpenRouter, Cerebras as the inference provider (`gpt-oss-120b`)
- **Auth**: bcrypt-hashed passwords, signed httpOnly session cookies

## Running it

Requires Docker. Put your OpenRouter API key in a `.env` file at the project root (`OPENROUTER_API_KEY=...`, see `.env.example`), then:

```bash
# Mac
scripts/start-mac.sh   # start
scripts/stop-mac.sh    # stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows (PowerShell)
scripts/start-window.ps1
scripts/stop-window.ps1

# Windows (CMD / Batch)
scripts\start-window.bat
scripts\stop-window.bat

# Windows (Git Bash)
scripts/start-window.sh
scripts/stop-window.sh
```

The app is available at http://localhost:8000.

## Development

See `CLAUDE.md` for architecture notes and current implementation status.

## License

Released under the [MIT License](LICENSE).
