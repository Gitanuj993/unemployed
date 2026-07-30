# AI Career Assistant

Finds jobs you can actually get, scores them so you can see *why*, and writes a
tailored resume grounded in work you've really done.

Built for **students and new grads**. Pick your region (India, US, UK, Europe,
Canada, Australia, Singapore, or anywhere), your target roles, and how much
experience you have — the filters follow.

Runs entirely on your machine. **No API keys, no paid services, no data leaves
your laptop.**

---

## What it does

**1. Finds jobs.** Reads public job boards from 90+ companies across Greenhouse,
Lever, Ashby and SmartRecruiters — Paytm, Meesho, PhonePe, Freshworks, Stripe,
Databricks, Notion, and more. **Search for any company by name** in settings: if
it has a public board on any of those platforms, one click adds it.

**2. Filters hard.** Drops senior roles, roles wanting more experience than you
have, non-engineering roles, and jobs outside your region. Every exclusion
carries a reason you can read.

**3. Scores explainably.** No black box — five weighted features you can inspect:

```
score = 0.30·required-skill coverage
      + 0.25·semantic similarity
      + 0.15·preferred-skill coverage
      + 0.15·keyword overlap
      + 0.15·preference fit
```

**4. Writes a truthful resume.** RAG over your own experience. Every bullet is
traced to a real accomplishment you entered — anything the model can't trace, or
any metric it invents, is rejected before it reaches the page. One-page,
single-column, ATS-parseable PDF, verified by round-tripping it through a text
extractor.

**5. Helps you get referred.** Builds targeted searches for the five kinds of
people worth contacting (alumni, recruiters, engineering leaders, people already
in the role, founders) plus a short grounded opening message. **Nothing is
scraped** — you run the search, so your LinkedIn account is never at risk.

**6. Suggests what to build.** One portfolio project specific to that company,
aimed at the skills the role wants that your experience can't yet prove.

---

## Setup

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/), plus
[Python 3.12+](https://www.python.org/downloads/) and
[Node 20+](https://nodejs.org/) if you want hot-reload development.

### Option A — everything in Docker

```bash
docker compose --profile app up -d
```
Then pull a model (~2 GB, once):
```bash
docker exec jobsearch-ollama ollama pull llama3.2:3b
```
Open **http://localhost:3000**.

### Option B — development (hot reload)

Infra in Docker, app on the host. Start the database and LLM:
```bash
docker compose up -d
```
```bash
docker exec jobsearch-ollama ollama pull llama3.2:3b
```

**Backend**, once:
```bash
cd backend && python -m venv .venv
```
Activate it — this is the only command that differs by OS:

| | |
|---|---|
| macOS / Linux | `source .venv/bin/activate` |
| Windows (PowerShell) | `.venv\Scripts\Activate.ps1` |
| Windows (Git Bash) | `source .venv/Scripts/activate` |

Everything after this is identical on every OS:
```bash
pip install -r requirements.txt && alembic upgrade head
```
```bash
uvicorn app.main:app --reload --port 8000
```

**Frontend**, in a second terminal:
```bash
cd web && npm install && npm run dev
```

> Every `python -m app...` command below assumes the venv is activated.

---

## First run

1. **Profile** — name, email, education, and your college (used to find alumni).
2. **Import** — upload your resume and any project/achievement documents. They're
   parsed into accomplishment "chunks" that you review and edit before saving.
   *This is the most important step: match and resume quality are bounded by how
   rich your knowledge base is.*
3. **Filters** — **your region**, role families, max years of experience, and
   preferred locations. Set the region first: it decides which jobs are even
   stored.
4. **Find companies** (once, ~5 min) — ships with 90+ already discovered, so this
   is only needed if you want more:
   ```bash
   python -m app.ingestion.discover
   ```
   Or search for companies by name in **Filters → Companies**, one at a time.
5. **Fetch jobs** (~2 min):
   ```bash
   python -m app.ingestion.run
   ```
6. **Score them** (~40 min — this is the local LLM working):
   ```bash
   python -m app.ingestion.enrich --top 100
   ```
7. Open **http://localhost:3000** and start applying.

In the Docker profile, steps 5–6 run automatically once a day.

---

## Using a different model

Any Ollama model works. Bigger models write better resume bullets but are slower:

```bash
docker exec jobsearch-ollama ollama pull llama3.1:8b
```
Then set `OLLAMA_MODEL=llama3.1:8b` in `.env` and restart the backend.
`llama3.2:3b` is the default because it runs comfortably on 8 GB of RAM; with
16 GB or more, `llama3.1:8b` writes noticeably better resume bullets.

**Already have Ollama installed natively?** It listens on `11434`; the bundled
container deliberately uses `11435` so the two never collide. To use your own
instead, set `OLLAMA_URL=http://localhost:11434` in `.env` and skip the
`ollama` container.

---

## Adding companies

**From the UI:** *Filters → Companies* → type a name → **Search** → **Add**. It
probes all four ATS platforms live and tells you which one hosts them.

**In bulk:** add names to `backend/app/connectors/companies.py`, then:
```bash
python -m app.ingestion.discover
```

Either way, a board is only accepted if it actually has jobs in **your region** —
board slugs collide across vendors (Ashby's `navi` is a US startup, not the Indian
neobank), so this check is what stops the wrong company being added.

---

## Checking it still works

```bash
python -m pytest tests/ -q
```
```bash
python -m app.eval.run
```
The eval prints extraction quality, filter leaks, and resume traceability against
your live data. `0 filter leak(s)` means nothing is slipping past the filters.

---

## How it's built

| | |
|---|---|
| Backend | FastAPI · SQLAlchemy · Alembic |
| Database | PostgreSQL + pgvector |
| Embeddings | `bge-small-en-v1.5` (384-dim, local) |
| LLM | Ollama (`llama3.2:3b` by default) |
| Frontend | Next.js · Tailwind · shadcn/ui |

**Where AI is used:** extracting requirements from job descriptions, embedding
for semantic search, generating resume bullets, drafting outreach, designing
project ideas.

**Where it deliberately isn't:** ranking is a transparent weighted formula, not
"ask the model if it's a good match". Deduplication, expiry, seniority and role
classification, and years-of-experience parsing are all deterministic — faster,
free, testable, and they don't change their mind between runs.

See [TEST_FLOW.md](TEST_FLOW.md) for a manual walkthrough of every feature.

## Useful checks
- API health: http://localhost:8000/health
- API docs (Swagger): http://localhost:8000/docs
- DB shell: `docker exec -it jobsearch-postgres psql -U jobsearch -d jobsearch`
