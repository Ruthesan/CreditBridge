# Decisions — what I chose, what I didn't build, and why

| Decision | What I chose | What I didn't build | Why |
|---|---|---|---|
| Intake confidence | 0.6 confidence threshold; flag rather than silently drop ambiguous rows | Per-bank hardcoded parsers | An LLM generalizes across inconsistent Nigerian bank export formats; hardcoded parsers don't, but silently guessing on a bad row is worse than flagging it and telling the trader what was excluded |
| Date parsing | Explicit format list tried in order (ISO first, then DD/MM/YYYY, etc.) | `dayfirst=True` heuristic guessing | Pandas' dayfirst guessing silently scrambled unambiguous ISO dates in testing (`2026-01-05` became day=1, month=5) — a wrong date corrupts every downstream monthly aggregate, so this has to fail loudly on a real ambiguity, not guess |
| Analysis engine | Pure Python/pandas, zero LLM calls | LLM-estimated financial ratios | Financial math driving a real credit decision must be deterministic and reproducible on the same input every time — an LLM "estimate" of a debt ratio isn't defensible if challenged |
| Scoring | Deterministic weighted rubric per lender, with hard floors that override the average | A single LLM call judging "is this business loan-ready?" | A credit decision needs to be explainable and auditable. A floor check (e.g. data quality below a lender's minimum) has to visibly disqualify, not get smoothed away by a good average elsewhere |
| Advisor | LLM explains the already-fixed scores; explicitly instructed never to re-score or contradict them | LLM that "reviews" the score and can adjust it based on context | Keeps language and judgment separate — language can quietly become the real decision-maker if you let it, which reintroduces the black-box problem scoring was designed to avoid |
| Automation | FastAPI `BackgroundTasks` for the upload webhook + APScheduler cron for monthly re-checks, with a skip-if-unchanged guard | Celery + Redis task queue | Right-sized for a single-instance portfolio deployment; a production system serving many businesses concurrently would need Celery for retry guarantees and horizontal scaling — naming that tradeoff is more honest than building infrastructure this project doesn't need yet |
| Eval harness | Deterministic exact/tolerance checks for intake, analysis, and scoring; LLM-as-judge *only* for the generative advisor output | LLM-graded checks across the board | Conflating the two produces either false confidence on math that should never be wrong, or unfair rigidity on language that's allowed to vary. A regression test (temporarily loosening the confidence threshold) confirmed the harness actually fails when it should — an eval suite that can't fail isn't testing anything |
| Auth / tenancy | One business = one login, JWT-based | Multi-user-per-business roles | Out of scope for a v1 aimed at a single trader managing their own readiness; the schema doesn't block adding roles later |

| Trust layer scope | Prompt-injection detection + structural sanity bound, applied only to the intake agent | Applying trust-layer checks to every agent uniformly | Analysis and scoring are pure Python and never see free-form user text; the advisor agent only sees our own validated output. Guarding agents that can't be attacked this way is theater, not defense — the guard belongs exactly where the attack surface actually is |
| Production config | Fail closed: refuse to start with `ENV=production` if the JWT secret, LLM mode, or database are still dev defaults | Log a warning and continue | A credit-scoring app booting in production with a public default secret is a real vulnerability. Warnings get ignored; a blocked startup doesn't |
| API testing | A separate pytest suite (auth, tenant isolation, upload limits) alongside the eval harness | Relying on the eval harness alone | The eval harness tests agent *judgment* against golden financial profiles; it says nothing about whether business B can see business A's data, or whether a 401 comes back correctly. Different failure modes need different tests |

| Password hashing | Direct `bcrypt` calls | `passlib[bcrypt]` | passlib is unmaintained since 2020, imports the stdlib `crypt` module (removed in Python 3.13+), and its bcrypt integration is known to break against `bcrypt>=4.1` due to a version-detection check passlib relies on that newer bcrypt removed. Depending on it was a latent bug waiting for a Python or bcrypt upgrade to trigger it |
| Dependency pinning | Floor + ceiling ranges (`>=x,<y`) on every package with a compiled/binary component | Exact pins (`==x.y.z`) everywhere | An exact pin has no prebuilt wheel for a Python version released after it — discovered firsthand when `pydantic==2.9.2` (pre-dates Python 3.14 support entirely) forced a from-source build requiring a Rust toolchain on a fresh Windows install. A floor lets pip resolve to a release that actually ships a wheel for whatever Python is running it; a ceiling stops an untested future major version from being pulled in silently (this surfaced immediately — floors alone pulled in pandas 3.0, a major version bump, on the first reinstall) |



Worth naming, since this is exactly the kind of thing "catch your own wrong
answers" means in practice:

- `pandas.to_datetime(..., dayfirst=True)` silently scrambled unambiguous ISO
  dates (`2026-01-05` → parsed as day=1, month=5). Fixed by trying explicit
  formats in order instead of guessing.
- NaN amounts passed the `amt <= 0` guard silently, because NaN comparisons
  are always `False` in Python.
- The orchestrator generated its own `run_id`, independent of the one already
  saved to the database and returned to the client — status polling 404'd.
  Fixed by threading the caller's `run_id` through.
- The eval harness's regression test didn't catch anything on its first run,
  because the mock intake parser gave every row the same fixed confidence
  score — so the confidence threshold had nothing to actually filter. Fixed
  by making the mock parser produce genuinely variable confidence.
- The APScheduler instance was a module-level singleton created once at
  import time. It binds to whatever asyncio event loop is running when
  `.start()` is called — fine for a single long-running process, but it
  breaks on any app restart (a worker reload, or the pytest suite spinning
  up a fresh `TestClient` per test), because the old instance keeps a
  reference to a now-closed event loop. Fixed by creating the scheduler
  fresh per app lifecycle and storing it on `app.state` instead of a global.

## Frontend rebuild (React/TS/Vite/Tailwind) — what I chose, what I didn't build, and why

| Decision | What I chose | What I didn't build | Why |
|---|---|---|---|
| Criterion categories | Presentation-layer grouping of the five real backend metrics (`net_cash_flow`, `cash_flow_volatility`, `data_quality_score`, `revenue_trend_pct`, `expense_to_revenue_ratio`) into the five requested labels (Cash Flow, Financial History, Business Performance, Profitability, Leverage) — see `metricCategory()` in `lib/utils.ts` | Inventing five separately-computed category scores | The backend computes five specific metrics, not five named categories. Relabeling them for display is honest; fabricating new numbers to match a spec's category names would not be |
| Notifications | A `NotificationContext` that polls `/pipeline/runs`, diffs real status transitions, and derives notifications only from genuine events (a run completing, failing, producing a ready lender match) | A notifications backend endpoint | None exists yet. Deriving from real polled state means every notification the user sees corresponds to something that actually happened, rather than a fabricated feed |
| Forgot / reset password | Fully designed UI flow that validates input and shows the standard confirmation states, clearly commented as not wired to a real email-sending backend | Skipping these pages, or silently pretending they work | The spec explicitly asks for these screens as part of the flagship deliverable. Building them to spec now means wiring in a real endpoint later is a drop-in change, and the code comments are explicit about the gap so it's never mistaken for a shipped feature |
| Password change / 2FA / account deletion | Visibly disabled controls labeled "Coming soon" | Simulating a fake success state | Unlike the reset-password flow (which sends nothing to a real account), letting someone believe they changed their actual login password when nothing happened is a materially worse deception. Disabling and labeling honestly was the right call here even though it's less polished |
| Lender comparison fields | Built the comparison entirely from real `LenderProfile` fields (type, approval threshold, weighted scoring criteria) plus the user's real computed score against each lender | Interest rate, maximum loan amount, fees, processing time, pros/cons, an "Apply" button | `LenderProfile` in the backend has no such fields — inventing specific interest rates or loan limits for a fintech product would be presenting fabricated financial terms as real data, and an "Apply" button with no backing endpoint would submit nothing. A "Compare" flow built on real scoring data serves the same underlying goal (helping a business pick a lender) without the fabrication |
| Reports: Download PDF / Print | Browser-native `window.print()` against a dedicated print stylesheet | A generated PDF via a backend renderer | No PDF-generation endpoint exists. The browser's own "Save as PDF" in the print dialog gets the same practical outcome (a downloadable PDF) without inventing a fake export pipeline |
| Recommendation "completion" checkmarks | Stored locally per business + run ID, since this is the user's own progress tracking, not backend data | A backend field for completed actions | Marking your own recommendation as done is inherently a client-side annotation; there's nothing to fabricate here since it was never a server-computed fact |
| Credit score trend chart | Derived by fetching each completed run's scores and averaging across lenders, reconstructed client-side from real run history | A dedicated score-history endpoint | `/pipeline/runs` plus per-run detail already contains everything needed to reconstruct this trend accurately; no endpoint gap to work around |
| Theme / dark mode | Light theme fully built; Dark and System shown as visibly disabled "Coming soon" options | A half-implemented dark mode retrofitted across every component | A dark mode bolted onto an already-complete component library without dedicated dark-mode styling on every surface would look broken in places — worse for a flagship portfolio piece than clearly deferring it |
| Session handling | On any 401, clear the token and redirect to `/login` | Silent token refresh | The backend issues a single 7-day JWT with no refresh endpoint (`config.py`), so there's nothing to refresh — a 401 means the session is genuinely over |

## Postgres over SQLite

Switched the default `DATABASE_URL` from SQLite to Postgres (`app/config.py`,
`.env.example`, `docker-compose.yml`; a `db` service was added there). SQLite
doesn't handle concurrent writers well — a fintech app scoring multiple
businesses' pipeline runs at once is exactly the workload it's weakest at.
`app/database.py` picks the driver generically off `DATABASE_URL`, so nothing
else in the app (models, queries, migrations) needed to change; SQLAlchemy's
`JSON` and `String` column types used in `db_models.py` were already portable
across both. Added `pool_pre_ping=True` to the engine, which matters for
Postgres specifically — it catches connections a managed Postgres instance
silently closed after sitting idle, before they'd otherwise surface as a
random request failure. Tests still run against a local SQLite file
(`tests/conftest.py` sets `DATABASE_URL` before the app imports) — that's a
deliberate, contained choice for fast/isolated test runs, not a sign Postgres
is optional anywhere else. Verified with a real local Postgres instance:
table creation, register, login, and a full upload → pipeline → completed
run all confirmed working end-to-end against it, not just SQLite.

## If I had another month

- **Real bank-format detection** — a small classifier or rule set that identifies which bank a CSV came from, rather than relying entirely on column-name heuristics/LLM inference.
- **More lender profiles** — the rubric config makes this cheap; I'd want 8–10 real Nigerian lender criteria sets instead of 3 illustrative ones.
- **Celery + Redis** for the automation layer, so scheduled re-checks don't block on a single worker as the business count grows.
- **Historical trend view** — the dashboard shows the latest run; a trader improving month over month should be able to see that trajectory, not just the current snapshot.
- **A second LLM-as-judge pass with an adversarial rubric** — testing that the advisor never overstates certainty ("you will get this loan") given the disclaimer is currently enforced by hand rather than by an eval.
