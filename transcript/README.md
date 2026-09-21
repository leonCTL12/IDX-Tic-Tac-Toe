# Transcript index

How the work in this repository was produced, which machine-generated session file corresponds to
which phase, and what the record does not contain.

## Tooling and models

- **Tool:** [opencode](https://opencode.ai) CLI. Every session record reports `"version": "1.18.31"`.
  (The exports below were re-run afterwards with the CLI binary on this machine, which reports
  `1.18.29`; the session `info` blocks are the authority on the version that ran.)
- **Provider:** `opencode-go`.
- **Model:** `deepseek-v4.1-flash` for every session, main and sub-agent.
- **Reasoning variant:** `high` for every session except the rule-design phase — its main session and
  its research sub-agent — which are `max`.
- **No other AI tool or model was used.** No Cursor, Copilot, Codex or Gemini configuration exists
  in this repo, because none was used.
- `git`, `python3` and `opencode export` appear in the record only as ordinary tools the agent or
  the human invoked by hand; they are not separate AI sessions.

The files under `transcript/` are raw `opencode export <sessionID>` output (`{ info, messages }`),
not summaries. Sub-agent runs are separate opencode sessions; they were exported with the same
command.

## Phases

Local time is `+08:00` on 2026-09-21. "Committed" lists the commit(s) the phase produced and the
artefacts that landed.

| # | Phase | Session file | Session ID | Time | Variant | Committed |
|---|-------|--------------|-----------|------|---------|-----------|
| 1 | Rule design + background research | `tic-tac-toe-no-draw-rule-design.json` | `ses_f3d7ae712ffex5kRic160Q1blv` | 13:51–14:18 | max | `a6a9727` — `docs/RULES.md`, `docs/research/no-draw-variants.md` |
| 2 | Grill the brief, write spec + domain docs | `grilling-tic-tac-toe-candidate-brief-with-rules-md.json` | `ses_f3d5fbc94ffe2TU9nyh1a4ZJDz` | 14:21–14:46 | high | `007d6aa` — `CONTEXT.md`, `docs/adr/0001-*`, `scratch/no-draw-tic-tac-toe/spec.md` |
| 3 | Per-repo skill config | `setup-matt-pocock-s-skills-config.json` | `ses_f3d4af205ffelASQxa9taZKv9o` | 14:44–14:44 | high | `7a4f91c`, `b3a5f06` — `AGENTS.md`, `docs/agents/*` |
| 4 | Break spec into tickets | `no-draw-tic-tac-toe-ticket-breakdown.json` | `ses_f3d45bbb9ffebu9ieLTrYL3NI6` | 14:49–14:52 | high | `2fe2397` — `scratch/no-draw-tic-tac-toe/issues/01..04` |
| 5 | Ticket 01: turns and both endings | `implement-no-draw-tic-tac-toe-game.json` | `ses_f3d4227d7ffefvCnQOy1mJ5s8l` | 14:53–14:58 | high | `ff7808c`, `86a1d6d` — `index.html`, `src/engine.js`, `src/ui.js`, `styles.css` |
| 6 | Ticket 02: New Game control | `implement-new-game-control-for-tic-tac-toe.json` | `ses_f3d3bf974ffeZXh8YKZ7K3fKHY` | 15:00–15:02 | high | `adb6de4`, `0494ea4` |
| 7 | Ticket 03: visibly distinct endings | `implement-two-distinct-game-endings-per-spec-03.json` | `ses_f3d393618ffes6hLQF2Ndoatb0` | 15:03–15:06 | high | `3b4cce0`, `1134dcf` |
| 8 | Write `docs/DESIGN.md` | `write-design-md-for-no-draw-tic-tac-toe.json` | `ses_f3d35fd92ffe1LhQfmDCtXP8bt` | 15:06–15:11 | high | `9a40dac`, `9d9f1a9` |
| 9 | Index transcripts, write this README | `creating-transcript-readme-with-tool-model-session-mapping.json` | `ses_f3d2dc34bffeVJP50Ijjp63fZ4` | 15:12–15:23 | high | `0fb4954`, `258b956` — `transcript/README.md`, `transcript/config/`, `.gitignore` |

Phases 2 and 3 overlap: the config session was run in the gap while the grilling session was open,
then both were committed together. The phase 9 export was committed in `258b956`, one commit after
the README it describes.

## Sub-agent sessions

These are the `task` runs spawned from the parent sessions above. Each parent record cites the
child's session id but does not inline the child's messages, so the child exports below are part of
the record. `transcript/subagents/`.

| Session file | Session ID | Parent phase | What it did |
|--------------|-----------|--------------|-------------|
| `research-no-draw-variants.json` | `ses_f3d77f36dffecafp5INUqno9Jy` | 1 | Exhaustive solver over all no-draw candidates; wrote `docs/research/no-draw-variants.md`. Its first run returned nothing and had to be resumed in the same session — that dead end is left in. |
| `explore-transcript-and-config-facts.json` | `ses_f3d5ea94cffe4zdGZYYNcrirnw` | 2 | Located where opencode stores sessions and config (`~/.local/share/opencode`, `~/.config/opencode`). |
| `review-ticket-01-standards.json` | `ses_f3d3fc240ffeiCe30v08OquDRS` | 5 | Standards half of the `/code-review` of ticket 01. |
| `review-ticket-01-spec.json` | `ses_f3d3fbc13ffeoQVaOx1WGqVL1a` | 5 | Spec half of the same review. |
| `review-ticket-02-standards.json` | `ses_f3d3b17beffed5NhY2JladHvCe` | 6 | Standards review of ticket 02. |
| `review-ticket-02-spec.json` | `ses_f3d3b1176ffeW6LhHnqEMKFtc5` | 6 | Spec review of ticket 02. |
| `review-ticket-03-standards.json` | `ses_f3d3855cdffeTPy0lHwGlTQa0D` | 7 | Standards review of ticket 03. |
| `review-ticket-03-spec.json` | `ses_f3d3850d9ffepVoEX3jzBGWKx5` | 7 | Spec review of ticket 03. |
| `review-design-md-standards.json` | `ses_f3d341cecffe1hvEb17E2fTpe9` | 8 | Standards review of `docs/DESIGN.md`. |
| `review-design-md-spec.json` | `ses_f3d3414e1ffewMNu4qWhGtWIVA` | 8 | Spec review of `docs/DESIGN.md`. |

## Configuration that shaped behaviour

Under `transcript/config/`, so the brief's "every configuration file" requirement is met without
reaching outside the repo:

- `AGENTS.md` — the repo's agent instructions (also live at the repo root).
- `docs/agents/{domain,issue-tracker,triage-labels}.md` — written by phase 3; the skills read these.
- `opencode.jsonc` — the user-level opencode config (`$schema` only; no project-level config exists).
- `skills/` — copies of the skills that were loaded during the work, from `~/.agents/skills/`:
  `grill-with-docs`, `grilling`, `domain-modeling`, `to-spec`, `to-tickets`,
  `setup-matt-pocock-skills`, `implement`, `research`, `code-review`. These live outside the repo by
  design, so they are copied here for the record. Skills present in `~/.agents/skills/` but never
  loaded are omitted.

## What is not captured

- **The session that wrote this README** (`ses_f3d2dc34bffeVJP50Ijjp63fZ4`) was not exported while it
  ran; the export was added afterwards, in `258b956`, as
  `creating-transcript-readme-with-tool-model-session-mapping.json`, and is indexed as phase 9. The
  write-up and the session that produced it are therefore both in the record now, but nothing about
  that session was captured live during the write-up itself.
- **Throwaway verification scripts.** `verify.mjs`, `ui-smoke.mjs` and the `check*.py` probes were
  written to a temp directory (`/var/folders/.../opencode/`) and never committed. The game-tree
  solver is not lost: its source is embedded in the appendix of `docs/research/no-draw-variants.md`
  and reproduces every number cited there.
- **opencode's backing store.** `~/.local/share/opencode/opencode.db` holds all sessions including
  credentials tables; it is not committed. The per-session JSON exports are the portable record.
- **Hand-typed commands outside opencode.** The initial commit `3a112cc` ("docs: add the requirement")
  at 13:47 and the manual `git`/`opencode export` commands are not in any session record.
- **No context compaction occurred.** Every session's `time_compacting` is unset in the store and no
  compaction event appears in the exports, so the transcripts are not truncated by the agent. The
  `summary` fields on some messages are git-diff summaries attached to turns, not compaction.
- **`.DS_Store`** was committed by accident in `007d6aa` and removed from tracking in `0fb4954`,
  which added it to `.gitignore`. It is no longer tracked.
