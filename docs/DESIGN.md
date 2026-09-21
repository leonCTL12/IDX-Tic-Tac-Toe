# Design — Tic-Tac-Toe, No Draws

This document is the brief's design deliverable. It records how the brief was read, the rule sets
that were considered and rejected, the argument that a Draw is impossible and that play always
terminates, how Balance is claimed and bounded, and what is known to be broken or unfinished.

The rule lives only in [RULES.md](RULES.md); this document does not define or alter it, and where it
must name the decision it links to [ADR-0001](adr/0001-lineless-full-board-awarded-to-o.md). The
numbers cited below are from [research/no-draw-variants.md](research/no-draw-variants.md), which
also contains the exhaustive solver that reproduces them. Domain terms carry the meanings given in
[CONTEXT.md](../CONTEXT.md), the project glossary.

## 1. Reading of the brief

The brief asks for a two-player tic-tac-toe **variant** in which (MUST) every **Terminal** position
has a winner, and (MUST) no line of play continues indefinitely, while remaining recognisably
tic-tac-toe: a 3×3 grid, two players, X and O, alternating turns. It fixes the medium
(HTML/CSS/JS, no build step, no backend, no network calls, current Chrome) and the deliverables
(game, `docs/RULES.md`, `docs/DESIGN.md`, commit history, `transcript/`), and it deliberately
leaves the interesting parts open.

We read "variant" as: keep standard tic-tac-toe and change as little as possible, because the
constraint that carries the risk is "recognisably tic-tac-toe", not originality (the brief says the
rule need not be original). So the design problem is not "invent a game"; it is "keep the standard
game and eliminate its one non-winning outcome, the Draw".

### Ambiguities found and how they were resolved

1. **What is a Draw, and when does a game end?** The brief forbids "a terminal state in which
   neither player has won" but never says what makes a position Terminal. We read it as: a game
   ends only when a Line win or a Fill win occurs, and every such position names a winner; a Draw
   is therefore a Terminal position with no winner, and must be unreachable. Recorded in
   [CONTEXT.md](../CONTEXT.md) (**Draw**, **Terminal**) and enforced by the engine having no draw
   outcome.
2. **The lineless full Board.** Standard tic-tac-toe's only non-winning Terminal positions are the
   16 full Boards with no Line (46,080 of 255,168 lines of play, 18.06%). Any variant that keeps
   the standard Line win must decide who gets them. This is the pivotal ambiguity and is resolved
   in ADR-0001: they are awarded to O. Because X moves first and nine is odd, the ninth move is
   always X's, so "the Board fills with no Line, O wins" is equivalently "the ninth move loses".
3. **A ninth move that both completes a Line and fills the Board.** The brief does not say which
   rule wins. Resolved as a Line win for its mover, so the Fill win can never steal an earned Line
   win. This is the only interaction between the two winning conditions; it is stated in
   [RULES.md](RULES.md) and encoded in the engine's status order (Line checked before the fill
   test).
4. **Must the variant be balanced?** The brief never mentions Balance; it asks only that every
   game have a winner. We treated Balance as a discretionary quality goal, not a requirement, and
   only insofar as it could be measured cheaply from the same exhaustive analysis. Section 4
   states exactly how weak the claim is.
5. **"Always terminates": structural or probabilistic?** The brief does not distinguish. Resolved
   structurally: a move occupies a previously empty cell, with no passing, capture, or removal, so
   the game cannot revisit a position and cannot exceed nine moves. No random device or tiebreak is
   used, so termination does not depend on chance.
6. **Where do decisions get recorded?** The brief asks that decisions and reasoning be recorded but
   does not say where. We split it: ADR-0001 for the one decision that a future reader would
   question, the research note for the evidence behind it, and this document for the combined
   reading. `docs/RULES.md` states only the playable rule.
7. **Match length, passing, moving or removing Marks.** The brief leaves these open. Resolved in
   the conventional way: place one Mark per turn, no passing, no moving, no removal, first Line
   wins.
8. **A computer opponent.** Explicitly optional and unscored. Declined; the game is human vs
   human.
9. **Deliverables outside the game.** `transcript/` and per-boundary commit history are brief
   requirements but are process rather than rule design, so they are handled as commits and as
   transcript files (see Section 5 for the one piece still outstanding).

## 2. Rule sets considered and rejected

The rule sets and their measured numbers are the research note's comparison table
([research/no-draw-variants.md §1](research/no-draw-variants.md)). Every number below is exact, from
exhaustive enumeration of the complete game tree (all 255,168 standard lines of play), not a
sample or a simulation. "Move-uniform" is the exact random-play probability split; "leaves" is the
share of terminal sequences; "greedy" is the exact split under win-or-block-then-random play;
"perfect" is the minimax value.

| # | Rule (delta from standard) | Draws? | Max len | Perfect | Move-uniform X/O | Leaves X/O | Greedy X/O | Verdict |
|---|---|---|---|---|---|---|---|---|
| — | Standard: own Line wins; lineless full Board is a draw | yes | 9 | draw | 58.5 / 28.8 | 51.4 / 30.5 | 31.1 / 17.4 | reject: 46,080 Draws |
| A | lineless full Board awarded to the last mover (X) | no | 9 | X, every opening | 71.2 / 28.8 | 69.5 / 30.5 | 82.6 / 17.4 | simplest fix, but lopsided |
| **B** | **lineless full Board awarded to the other player (O)** | **no** | **9** | **O, no winning opening** | **58.5 / 41.5** | **51.4 / 48.6** | **31.1 / 68.9** | **chosen (ADR-0001)** |
| C | misère (own Line loses) + full Board to the last mover | no | 9 | X, centre only | 41.5 / 58.5 | 48.6 / 51.4 | 26.5 / 73.5 | balanced, but longer wording and a known forced X win |
| D | misère + full Board to the other player | no | 9 | O, no winning opening | 28.8 / 71.2 | 30.5 / 69.5 | 13.7 / 86.3 | reject: dominated by B |
| E | a move wins by fully occupying any Line, whatever the symbols | no | 7 | X, every opening | 51.6 / 48.4 | 44.6 / 55.4 | 100 / 0 | reject: unintuitive, brittle under simple play |
| F(i) | O pre-placed on the centre + full Board to the last mover | no | 8 | O, no winning opening | 19.3 / 80.7 | 21.7 / 78.3 | 4.2 / 95.8 | reject: badly O-dominant |
| F(ii) | O pre-placed on the centre + full Board to the other player | no | 8 | X, corners only | 30.7 / 69.3 | 39.5 / 60.5 | 70.0 / 30.0 | reject: handicap does not balance |
| G | Maker–Breaker: X wins a Line, O wins a filled Board with no X Line | no by definition | 9 | X, centre and corners | 77.8 / 22.2 | 71.0 / 29.0 | 34.1 / 65.9 | viable, but asymmetric goals |
| H | Notakto: both players place X; completing a Line loses | no | 7 | first, centre only | 48.4 / 51.6 | 55.4 / 44.6 | 62.8 / 37.2 | simplest and best casual balance, but single-symbol |

Two notes on reading the table. The standard row is the baseline, not a candidate, and its greedy
and leaf columns omit the Draw share (51.5% and 18.1% respectively). H's two players are "first"
and "second" rather than X and O, because both players place the same symbol.

The reasoning behind the choice, in the terms ADR-0001 uses:

- The brief's only hard requirement is "no Draw". Rule A is the smallest possible change that
  achieves it, but awarding the lineless board to the player who moved last gives it to X and
  makes X win 69.5% of lines of play with every opening a forced X win. Rejected as lopsided.
- **Rule B** (the chosen rule) resolves the same ambiguity in the opposite direction. It is one
  sentence, no Draws, terminates by nine, and is the closest to even under both casual measures
  (leaves 51.4 / 48.6; move-uniform 58.5 / 41.5). Its cost is that it hands the forced win to O
  under perfect play, and that competent (greedy) play steers games to filled Boards, where O wins
  68.9%. Section 4 explains why that cost is unavoidable and how it is bounded.
- Rule C is the mirror image of B in casual balance, and misère is a well-known variant, but it
  needs a longer sentence and gives X a short, teachable forced win (centre plus 180° mirror),
  verified over all 360 O reply sequences.
- D is B's forced winner (O) with much worse balance; B dominates it. The F variants add two rules
  and the fill tiebreak still dominates the outcome; B dominates F(i) too.
- E and G are no-Draw by construction but change the character of the game more than B: E allows a
  mixed line to win and is degenerate under greedy play (X 100%), while G makes O unable to win by
  a Line, which is no longer recognisably tic-tac-toe.
- H has the simplest rule of all and the best casual balance, but it uses a single symbol and so
  stretches "X and O alternating". The brief's recognition constraint rules it out.

The one interpretation fixed by the research note that matters to the table: a move that both
completes a Line and fills the Board is resolved as a Line result. This is also the interaction
decision in Section 1, ambiguity 3.

## 3. Why no Draw is possible, and why play always terminates

**Termination.** Fix the starting position (empty **Board**, X to move). Every legal move places a
Mark in a cell that was empty, and the rules provide no passing, no capture, no removal, and no way
to move an existing Mark. The number of Marks on the Board therefore increases by exactly one on
every move, from 0 towards at most 9. A strictly increasing integer cannot revisit a value, so no
position repeats and no cycle exists: the state graph is a finite DAG graded by Mark count. Play
therefore cannot continue past the ninth move. The research note's solver asserts, for every edge
of every enumerated tree, that the child has exactly one more Mark than its parent, and terminated
without any cycle or recursion guard for all candidates.

**No Draw.** The rule ([RULES.md](RULES.md)) declares exactly two ways a game can end. In the
first, a player completes a Line of their own Marks; the winner is that player, a **Line win**. In
the second, the Board reaches nine Marks with no Line at all; the winner is O, a **Fill win**. Every
position is therefore in exactly one of three cases:

1. some Line is present — Terminal, and the winner is the player who completed it. At a reachable
   position at most one Line exists, because play stops the moment the first Line appears, so the
   winner is the player who has just moved;
2. no Line, Board full — Terminal, winner is O;
3. no Line, Board not full — not Terminal, and by the termination argument play continues.

Cases 1 and 2 are the only Terminal positions, and each names a winner. A **Draw** would be a
Terminal position in neither case 1 nor case 2, and there is no such case; the rule's end-of-game
test is total and every branch of it assigns a winner. This is why the variant has no "draw"
outcome to represent: it is not that Draws are merely rare, it is that the rule's Terminal test
never produces one. The ninth-move precedence (ambiguity 3) matters here: a full Board that
contains a Line is decided by case 1, so it is a Line win, not a Fill win — but either branch
still has a winner.

**The exhaustive check.** The informal argument above is about the rule; the research note is the
machine-checked evidence that the rule, as interpreted, behaves this way over all play. The solver
enumerates every legal sequence of moves for each candidate, stopping at Terminal positions, and
reports for the chosen rule B ([§6](research/no-draw-variants.md)):

- 255,168 terminal lines of play, split X 131,184 / O 123,984 / draw **0**;
- maximum length **9** moves;
- 5,478 distinct reachable (Board, turn) states, 549,946 nodes in the unfolded tree;
- the 46,080 terminal lines of play that were Draws under the standard rule are reclassified as O
  Fill wins, and all 16 distinct lineless full Boards are reachable in normal play.

Because the tree is finite and fully enumerated, this is a statement about all play, not a sample:
zero Draws and a maximum length of nine. The research note's standard baseline reproduces the
classic counts (255,168; 131,184 / 77,904 / 46,080) exactly, which cross-checks the enumeration
against the literature before it is trusted for the variant.

## 4. Balance: what is claimed, and what is not

**Perfect-play Balance is impossible in any no-Draw variant.** In a finite perfect-information game
with no Draws, Zermelo determinacy says exactly one player has a forced win; the third outcome,
"both can hold", requires Draws to exist. So a 50/50 perfect-play split cannot exist for any rule
that satisfies the brief. Under the chosen rule, perfect play is an O win, and X has no winning
opening (every one of the nine first moves has value O). That is not a defect of this rule; it is
forced on every candidate ([research/no-draw-variants.md §3.6](research/no-draw-variants.md)).

**Empirical Balance is claimed only under a named play policy.** The policy is *uniform random
play*: each player chooses uniformly among the legal moves. Under that policy the chosen rule's
outcome split is X **58.5%** / O **41.5%**, with no Draw. Under the alternative presentation, the
share of terminal sequences, it is X **51.4%** / O **48.6%**. Neither figure is a claim about
competent play, and the document deliberately does not make one:

- Under a greedy policy (win if possible, otherwise block the opponent's immediate win, otherwise
  move at random), the split is X **31.1%** / O **68.9%**: a player who knows only "win or block"
  steers games to filled Boards, where the rule gives them to O. The variant must not be described
  as balanced for competent play.
- The three measures disagree because they weight long games differently; a reader judging
  "balance" must say which distribution is meant. The move-uniform figure is the one a bored
  human approximates; the greedy figure is the one a beginner approximates.

In short: this variant is defended as *near-even for casual, near-random play*, and its perfect-play
value is a forced O win, which is unavoidable. The swap (pie) rule was also checked and does not
restore theoretical Balance: in a no-Draw game it moves the forced win to the second player
([research/no-draw-variants.md §3.7](research/no-draw-variants.md)).

## 5. Known broken or unfinished

- **`transcript/README.md` is not written.** The brief asks for a short index of which tools and
  models were used and which session file corresponds to which phase. The raw session files are
  committed under `transcript/`, but the index that maps them to phases is still outstanding. This
  is the one brief deliverable not yet complete.
- **No automated verification at the engine seam.** By decision (spec, *Testing Decisions*), no
  test runner is introduced. The no-Draw and termination argument above is informal prose plus the
  research note's exhaustive enumeration, which is a check of the **rule**, not of the JavaScript
  engine. The engine is a direct encoding of that rule, but nothing mechanically proves the two
  stay in step. If rule/engine drift is ever suspected, the fix is the spec's seam test: walk every
  line of play from `createGame()` via `legalMoves`/`applyMove` and assert every Terminal state has
  a winner, `legalMoves` is empty at Terminal states, and no line of play exceeds nine moves.
- **No computer opponent.** Explicitly optional and unscored by the brief; human vs human only.
- **Visual polish and accessibility are minimal and consciously unscored.** The Board is rendered
  plainly; a Line win highlights its three cells and a Fill win gets a distinct treatment (ticket
  03), which is enough to make the variant visible. Responsive layout, animation, sound, and a full
  accessibility pass were not attempted; the live status region and per-cell labels are the extent
  of it and have not been audited.
- **Time box.** The brief allows a maximum of three hours of *active* work. The only evidence the
  repository can offer is commit timestamps: at the time of writing, the commits span 13:47 to 15:06
  on 2026-09-21, about 1 hour 20 minutes of wall-clock, and active work is necessarily a subset of
  that. On that evidence the box has not been exceeded; a reader who needs an exact active-work
  figure should treat the commit timestamps and `transcript/` as the record, not this sentence.
- **Issue tracker state is manual.** The tickets under `scratch/no-draw-tic-tac-toe/issues/` are
  marked `ready-for-agent` and are not automatically flipped to done when the work lands.

## 6. Document map

- [RULES.md](RULES.md) — the rule, and the only authority for it.
- [ADR-0001](adr/0001-lineless-full-board-awarded-to-o.md) — why the lineless full Board goes to O.
- [research/no-draw-variants.md](research/no-draw-variants.md) — exhaustive enumeration of all
  candidates, the comparison table, and the solver.
- [CONTEXT.md](../CONTEXT.md) — the glossary this document and the code use.
- [AGENTS.md](../AGENTS.md) — how to run the game and the engine/interface conventions.
