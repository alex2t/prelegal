# Prelegal Project


## Overview

This is Saas product to allow users to draft legal agreements based on templates in the templates directory. The user  can cary a AI chat in order to establish whate document they want and how to fill in the fields. The available documents are  covered in catalog.json file in the project root, included here:

@catalog.json

See "Implementation Status" below for what's actually built vs. still pending.

## Development process

When instructed to build a feature:

 1. Use your Atlassian tool to read the feature instruction from Jira
 2. Develop the feature - do ot skip any step from teh feature-dev 7 step process
 3. Thoroughly test the feature with unit tests and intergation tests and fix any issue
 4. Submit a PR using your github tools

## AI Design

When writting code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `gpt-oss-120b model` with Cerebras as the interference provider. you should use Sctuctured Outputs so that you can interpret the results and populate field in the legal document
 
 There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLITE and be created from scratch each time the docker container is brough up, allowing for a users table with sign up and sign in.  
Consider statically building teh frondend and serving it via FastAPI, if that will work.  
    There should be scripts/ for.#  

```bash
 # Mac
 scripts/start-mac.sh # Start
 scripts/stop-mac.sh  #Stop

  # Mac
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

 Backend available at http://localhost:8000
 ```

 ## Color Scheme

 - Accent Yellow: #ecad0a
- Blue Primary: #209dd7
- Purple Secondary: #753991 (submit buttons)
- Dark Navy: #032147 (headings)
- Gray text: #888888

## Implementation Status

**Foundation**: `backend/` is a uv-managed FastAPI app. SQLite `users` table is recreated from scratch on every startup (schema only — no signup/signin endpoints yet). Frontend is a statically-exported Next.js app served by FastAPI from a single Docker image on port 8000. `scripts/start-*` / `stop-*` cover mac, linux, and windows (bash, PowerShell, batch). Login is fake (always succeeds, sets a client-side-only session flag) — there is no real authentication yet.

**AI chat**: `backend/src/backend/chat.py` routes a freeform conversation to whichever of the 11 catalog documents the user wants, then fills in that document's fields conversationally, always returning the complete field snapshot each turn. Each document has its own field schema + prompt (`backend/src/backend/documents/`), field/document-generator/standard-terms modules (`frontend/src/lib/`), and preview/PDF components (`frontend/src/components/`, sharing a common `CoverPageLayout`/`CoverPagePdfLayout`). `frontend/src/app/page.tsx` picks which document's UI to show via a `DOCUMENT_REGISTRY` keyed by document type.

**Documents supported: all 11 in catalog.json** — Mutual NDA, Design Partner Agreement, Cloud Service Agreement, Service Level Agreement, Professional Services Agreement, Data Processing Agreement, Software License Agreement, Partnership Agreement, Business Associate Agreement, Pilot Agreement, AI Addendum.

Simplifications applied to the 8 added after the Mutual NDA/Design Partner Agreement/Pilot Agreement (none of them have an official fill-in cover page in `templates/`, so each one's field set was designed from scratch — see PL-10's Jira description for the full rationale):
- Two-tier real specs (CSA's Key Terms+Order Form, PSA's Key Terms+SOW) are flattened to one flat field set — no per-subscription/per-SOW repeating UI.
- Fields that would need legal drafting judgment (Additional Warranties, Obligations, Permitted Uses, etc.) are taken verbatim from the user, never drafted by the AI.
- SLA, BAA, and AI Addendum are real Common Paper riders that can't stand alone (their fields normally live on a separate base agreement) — each was given the same "invent minimal standalone fields" treatment as Design Partner Agreement/Pilot Agreement, rather than building real cross-document-attachment architecture.
- DPA's GDPR annexes (subprocessor lists, data categories) are plain text fields, not structured tables.

**Not yet implemented**:
- Real authentication/signup (the `users` table exists but has no endpoints).
- Real cross-document attachment (a BAA/AI Addendum/SLA that actually links to another generated document, rather than a free-text description of it).

