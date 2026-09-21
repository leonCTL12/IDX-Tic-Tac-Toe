# Tic-Tac-Toe, No Draws — playable game

Status: ready-for-agent

## Problem Statement

A candidate exercise asks for a two-player 3×3 tic-tac-toe variant in which a game can never
end in a draw and every line of play terminates. The rule has been chosen and stated
(`docs/RULES.md`), and the exhaustive evidence that it works has been recorded
(`docs/research/no-draw-variants.md`), but there is no game to play and no design document
arguing that the implementation matches the rule. A reviewer opening the repo can read a rule
but cannot play it, and cannot see why it is correct.

## Solution

A static, dependency-free browser game that implements the stated variant exactly: X moves
first, three of a player's own marks in a line is a line win, and a **fill win** goes to O when
the board fills with no line. A line completed on the ninth move still wins outright. A draw is
not a reachable outcome, and the interface cannot present one.

All rule logic lives in a single pure, DOM-free engine module; the interface layer only renders
the board and the engine's status and forwards clicks. A winning line is highlighted, and a fill
win is presented distinctly from a line win so the variant is visible in play. `docs/DESIGN.md`
records the reading of the brief, the rejected rule sets, and the argument that draws are
impossible and play always terminates.

## User Stories

1. As a player, I want to take turns placing marks on a 3×3 board, so that I can play a game of
   tic-tac-toe.
2. As X, I want to move first, so that the game follows tic-tac-toe convention.
3. As a player, I want to place my mark in any empty cell, so that I can pursue a line.
4. As a player, I want the game to refuse a mark on an occupied cell, so that I cannot overwrite
   an existing mark.
5. As a player, I want to see whose turn it is, so that I know when to move.
6. As a player, I want to win by completing a line of three of my own marks, so that I get the
   standard tic-tac-toe win.
7. As X, I want a line I complete on the ninth move to win outright, so that the fill rule never
   steals a win I have earned.
8. As O, I want to win when the board fills with no line, so that a lineless full board still
   produces a winner.
9. As a player, I want the game to announce the winner, so that I know the game has ended.
10. As a player, I want the announcement to say whether the game ended in a line win or a fill
    win, so that I can see the variant working rather than taking it on faith.
11. As a player, I want the winning line highlighted when a line win occurs, so that I can see
    why the game ended.
12. As a player, I want a fill win to look different from a line win, so that I can tell there
    was no line at all.
13. As a player, I want to start a new game, so that I can play again after a game ends.
14. As a player, I want a new game to reset the board completely, so that no marks carry over.
15. As a player, I want to be unable to place a mark after the game has ended, so that a
    terminal position cannot change.
16. As a player, I want never to see a draw, because the variant guarantees every game has a
    winner.
17. As a player, I want every game to end within nine moves, so that play always terminates.
18. As the candidate, I want the rules stated plainly enough for a stranger to play from a
    printed copy, so that the variant needs no reference to the code.
19. As the candidate, I want the engine to be the only place rules live, so that the interface
    layer cannot contradict the rule or drift from it.
20. As the candidate, I want the engine to be pure and DOM-free, so that its behaviour can be
    reasoned about in isolation from rendering.
21. As the candidate, I want the engine's state to be immutable, so that a move produces a new
    position and earlier positions cannot be corrupted.
22. As the candidate, I want an illegal move to throw rather than be silently ignored, so that
    mistakes surface instead of hiding.
23. As the candidate, I want terminal states to have no legal moves, so that the engine itself
    makes continuing a finished game impossible.
24. As the reviewer, I want `docs/DESIGN.md` to record my reading of the brief and the
    ambiguities I resolved, so that my decisions are defensible without me in the room.
25. As the reviewer, I want `docs/DESIGN.md` to list the rule sets I considered and rejected,
    with reasons and measured numbers, so that the chosen rule is visibly a considered choice.
26. As the reviewer, I want `docs/DESIGN.md` to argue that draws are impossible and that play
    always terminates, backed by the exhaustive enumeration already in the repo, so that the
    correctness claim is supported rather than asserted.
27. As the reviewer, I want `docs/DESIGN.md` to state anything that is broken or unfinished, so
    that I am not misled about the state of the work.
28. As the candidate, I want the ADR to record why a lineless full board is awarded to O, so
    that the most surprising part of the rule is explained to future readers.
29. As an agent working on this repo, I want `AGENTS.md` to state how to run the game and the
    conventions to follow, so that future sessions respect the engine/interface seam.
30. As an agent working on this repo, I want the glossary in `CONTEXT.md`, so that I name domain
    concepts consistently with the rest of the project.
31. As a reviewer, I want to run the game with a static server and no build step, so that
    trying it out takes one command.
32. As a reviewer, I want the game to work in current Chrome with no dependencies or network
    calls, so that nothing needs installing.

## Implementation Decisions

- **Rule authority.** `docs/RULES.md` remains the single source of truth. The engine encodes
  that rule and nothing else; if the rule changes, `docs/RULES.md` changes first.
- **One engine module, pure and DOM-free.** It owns every rule decision: legal moves, turn
  order, line wins, the fill win, and the precedence of a ninth-move line over the fill rule.
  It is an ESM module, browser-only, with immutable state transitions.
- **Engine interface contract** (from the design session; the exact shape encodes decisions that
  prose would blur):

  ```
  createGame()                      -> State
  board(state)                      -> ReadonlyArray<'X' | 'O' | null>
  currentPlayer(state)              -> 'X' | 'O'
  legalMoves(state)                 -> number[]            // empty iff terminal
  applyMove(state, cell)            -> State               // immutable; throws on illegal
  status(state)                     -> {
                                         over: boolean,
                                         winner: 'X' | 'O' | null,
                                         reason: 'line' | 'fill' | null,
                                         line: [number, number, number] | null,
                                         moveCount: number
                                       }
  ```

  `State` is opaque to the interface layer, which must not read it directly. `reason: 'fill'`
  can only ever accompany a win by O. `line` holds the three cells of a line win and drives the
  highlight; it is `null` for a fill win.
- **One interface module, no logic.** It renders the board from `board(state)`, renders whose
  turn it is from `currentPlayer(state)`, forwards clicks to `applyMove`, and renders the
  result from `status(state)`. It performs no rule check of any kind — in particular it does not
  decide whether a move is legal or who has won.
- **Winning-line highlight** is driven entirely by `status.line`. A fill win gets a distinct
  treatment (the whole board is indicated as full with no line) so the two endings are visually
  different.
- **New Game** calls `createGame()` for a fresh State; there is no separate reset path.
- **Illegal clicks** (occupied or terminal cells) must not mutate state; the interface ignores
  them and the engine's `applyMove` throws if one is ever attempted.
- **No build step, no dependencies, no network, no backend.** Browser-only ESM served by
  `python3 -m http.server`. No transpiling or polyfills; current Chrome only.
- **Documentation deliverables.** `docs/DESIGN.md` is written to cover the brief's four required
  areas: reading of the brief and ambiguities resolved; rejected rule sets and why; the
  no-draw and termination argument; and known unfinished work. The argument is informal prose
  that cites the exhaustive enumeration already committed under `docs/research/`.
- **Already produced by the design phase, not part of this spec's tickets:** `docs/RULES.md`,
  `docs/research/no-draw-variants.md`, `CONTEXT.md`, `docs/adr/0001-lineless-full-board-awarded-to-o.md`,
  `AGENTS.md`, and the issue-tracker configuration under `docs/agents/`.

## Testing Decisions

- **What makes a good test here:** one that asserts externally observable engine behaviour over
  the real reachable game tree, never internal representation. A test that inspects a State's
  internals, or that re-derives a rule, is testing implementation detail and is wrong.
- **No automated test runner is introduced.** By decision, the correctness argument is informal
  prose in `docs/DESIGN.md`, backed by the exhaustive enumeration of the *rule* already recorded
  in `docs/research/no-draw-variants.md` (all 255,168 lines of play, zero draws, maximum length
  9). The brief does not score test coverage beyond what supports this argument.
- **The one seam** is the engine's public interface above. It is the highest seam available —
  the interface module is deliberately logic-free, so there is nothing meaningful to assert
  there. If automated verification is ever added, it targets this seam and nothing else,
  exhaustively: walk every legal line of play from `createGame()` via `legalMoves`/`applyMove`
  and assert that every terminal state has a non-null `winner`, that `legalMoves` is empty at
  terminal states, and that no line of play exceeds nine moves.
- **Prior art:** the Python exhaustive solver embedded in `docs/research/no-draw-variants.md`
  is the model for such a check, and the numbers `docs/DESIGN.md` cites.

## Out of Scope

- A computer opponent. Explicitly optional and not scored by the brief.
- Undo, move history, running score, and any multi-game tracking.
- Visual polish: animation, sound, responsive layout, and accessibility work are not scored.
- Automated tests and any test runner or Node tooling.
- Transcript export, `transcript/README.md`, and commit boundaries — handled by the candidate
  outside this spec; commits are made per ticket.
- Changes to the rule itself. The rule is frozen in `docs/RULES.md`; this spec implements it.

## Further Notes

- **Why the fill win goes to O** is recorded in ADR-0001. In short: keeping the standard line
  win forces a decision on the lineless full board, and awarding it to O is the smallest change
  with the best casual balance. Because X moves first and nine is odd, the ninth move is always
  X's, so "the board fills with no line, O wins" is equivalently "the ninth move loses".
- **Perfect-play balance is impossible** in any no-draw variant: Zermelo determinacy means
  exactly one player has a forced win. Under this rule that player is O. "Balance" is therefore
  claimed only empirically — X 58.5% / O 41.5% under uniform random play — and `docs/DESIGN.md`
  must not overclaim it.
- **Termination is structural, not probabilistic:** every move occupies one previously empty
  cell, with no passing, capture, or removal, so the game is a DAG graded by mark count and
  cannot exceed nine moves.
- The 16 historically drawn full boards are reclassified as fill wins for O; all 16 are
  reachable in normal play.
- The engine must be able to represent only terminal positions that have a winner; a draw is not
  a runtime concept in this project (see `CONTEXT.md`).
