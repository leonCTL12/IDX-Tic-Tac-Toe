# AGENTS.md

## Project

A browser implementation of *Tic-Tac-Toe, No Draws*: a 3×3 variant in which every game has a
winner. Built for a candidate exercise — see `AI Dev Test - Candidate brief.md`.

## Rules authority

`docs/RULES.md` is the single source of truth for the game's rules. Never restate, re-derive or
"improve" the rules elsewhere; change `docs/RULES.md` first if a rule must change.

The variant: X moves first; three of your own marks in a line wins; if the board fills with no
line, O wins. A line completed on the ninth move still wins outright.

## Layout

- `index.html` — the page.
- `styles.css` — plain styling; visual polish is explicitly not scored.
- `src/engine.js` — all rule logic. Pure, DOM-free, ESM. This is the only place rules live.
- `src/ui.js` — DOM rendering and click forwarding. No rule logic whatsoever.
- `CONTEXT.md` — glossary. Glossary only; never put implementation detail in it.
- `docs/` — `RULES.md`, `DESIGN.md`, `research/`, `adr/`.

## Run

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. ES modules need the server; `file://` will not work.

## Conventions

- No build step, no dependencies, no network calls, no backend. Static files only.
- The UI must decide nothing: it reads state and the engine's status, renders, and forwards
  clicks. Anything that looks like a rule check belongs in `src/engine.js`.
- The engine's state is immutable; `applyMove` returns a new state and throws on an illegal
  move. Terminal states have no legal moves.
- A draw is not a runtime outcome. The UI must never be able to render one.
- Target current Chrome only. No transpiling, no polyfills.

## Verification

There is no test runner. The correctness argument for "no draws" and "always terminates" is
informal prose in `docs/DESIGN.md`, backed by the exhaustive enumeration (all 255,168 lines of
play, zero draws, maximum length 9) recorded in `docs/research/no-draw-variants.md`.

## Agent skills

### Issue tracker

Issues live as markdown files under `scratch/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`CONTEXT.md` + `docs/adr/`). See `docs/agents/domain.md`.
