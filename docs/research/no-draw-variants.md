# No-draw variants of 3x3 tic-tac-toe: exhaustive solver evidence and source review

Research note, 2026-09-21. Scope: this file answers one design question — can two-player 3x3
tic-tac-toe (X and O alternating, no passing) be modified so that (MUST) no terminal state is a
draw and (MUST) every line of play terminates, with (NICE) a simple rule and similar first/second
win rates. It is evidence for a later `docs/RULES.md` / `docs/DESIGN.md`, not a decision.

**Method.** Part 1 is primary evidence produced here: a stdlib-only Python program that
*exhaustively enumerates the complete game tree* for each rule set (every legal move sequence,
stopping at terminal positions). Nothing is sampled. Leaf counts are exact; the uniform-random and
greedy outcome distributions are computed by exact rational dynamic programming, not simulation.
Exploration of this finite tree is therefore a proof over all play, not evidence from a sample.
The solver is in the appendix; every number below is reproduced by `python3 solver.py`.

Cell numbering used throughout:

```
0 1 2
3 4 5
6 7 8
```

X moves first, except rule F, where O is pre-placed on the centre before X's first move.

**Interpretations fixed here** (the brief left these open):

- A move that both completes a line and fills the board is resolved as a *line* result; the line
  check happens on the move. This only matters for B and C.
- Length is the number of moves made after the starting position (for F, the pre-placed stone is
  not counted).
- "Random play" means each player chooses uniformly among *legal moves*. This gives different
  outcome probabilities from the "share of terminal sequences", because a terminal sequence at
  the end of a long path is less likely than one on a short path. Both are reported.
- "Greedy" means: take an immediate win if one exists; otherwise choose uniformly among moves
  after which the opponent has no immediate win; otherwise choose uniformly among all legal moves.
  "Immediate win" is evaluated with each rule's own terminal test.

---

## 1. Comparison table (all candidates)

"Random" is the exact move-uniform probability split (X% / O% / draw%); "leaves" is the share of
terminal sequences (the framing behind the classic 255,168). "Greedy" is the exact split under the
greedy policy. Perfect play is the minimax value; winning first moves are the opening cells (rules
with a pre-placed stone list only empty cells).

| # | Rule (delta from standard) | Sentences | Draws? | Max len | Perfect play | Random (move-uniform; leaves) | Greedy | Verdict |
|---|---|---|---|---|---|---|---|---|
| — | **Standard**: own 3-in-a-row wins; lineless full board is a draw | 3 | yes, 18.06% of leaves | 9 | draw | X 58.5 / O 28.8 / D 12.7; leaves 51.4 / 30.5 / 18.1 | X 31.1 / O 17.4 / D 51.5 | reject: draws |
| A | standard + "**last mover wins a lineless full board**" (= X wins a full board) | 4 | **no** | 9 | **X**, all 9 openings | X 71.2 / O 28.8; leaves 69.5 / 30.5 | X 82.6 / O 17.4 | viable but X-dominant; simplest possible fix |
| B | standard + "**last mover loses a lineless full board**" (= O wins a full board) | 4 | **no** | 9 | **O**, no winning opening | X 58.5 / O 41.5; leaves 51.4 / 48.6 | X 31.1 / O 68.9 | **strongest simple candidate**; near-even casual play; perfect play O |
| C | misère (own line loses) + "last mover wins a lineless full board" | 4 | **no** | 9 | **X**, centre (4) only | X 41.5 / O 58.5; leaves 48.6 / 51.4 | X 26.5 / O 73.5 | viable; balanced casual play; known X mirror win |
| D | misère + "last mover loses a lineless full board" | 4 | **no** | 9 | **O**, no winning opening | X 28.8 / O 71.2; leaves 30.5 / 69.5 | X 13.7 / O 86.3 | reject: dominated by B |
| E | a move wins by making **any** line fully occupied, whatever the symbols | 3 | **no** | **7** | **X**, all 9 openings | X 51.6 / O 48.4; leaves 44.6 / 55.4 | X 100 / O 0 | reject: rule is unintuitive; greedy is degenerate |
| F(i) | O pre-placed on centre + "last mover wins a full board" | 5 | **no** | 8 | **O**, no winning opening | X 19.3 / O 80.7; leaves 21.7 / 78.3 | X 4.2 / O 95.8 | reject: badly O-dominant |
| F(ii) | O pre-placed on centre + "last mover loses a full board" | 5 | **no** | 8 | **X**, corners (0,2,6,8) | X 30.7 / O 69.3; leaves 39.5 / 60.5 | X 70.0 / O 30.0 | reject: handicap does not balance |
| G | Maker–Breaker: X wins by an X line, O wins a filled board with no X line | 5 | **no by definition** | 9 | **X**, centre + corners | X 77.8 / O 22.2; leaves 71.0 / 29.0 | X 34.1 / O 65.9 | viable reference; asymmetric goals, not classic tic-tac-toe |
| H | single-board Notakto: **both players place X**; completing a line loses | 3 | **no** | **7** | **X**, centre (4) only | first 48.4 / second 51.6; leaves 55.4 / 44.6 | first 62.8 / second 37.2 | **simplest rule and best random-play balance**; but single-symbol and first player has a known forced win |

Reference row (not a candidate, used to check the literature): misère with **no** tiebreak is a
draw with perfect play (X 28.8 / O 58.5 / D 12.7 move-uniform; leaf split X 30.5 / O 51.4 / D
18.1); only the centre opening survives, every other first move loses for X.

Dominance summary: **B dominates A** on balance (same tree; the tiebreak is given to the player
who is behind under random play rather than ahead); **B dominates D and F(i)** (same or better
balance, simpler rule, same forced winner O); **D is the mirror-image worst case** of B. E and G
are no-draw by construction but change the character of the game more than B/C. H is the simplest
and most balanced empirically, but it is X-only.

---

## 2. Part 1 results in detail

### 2.1 Standard baseline (confirmation)

Exhaustive enumeration reproduces the classic numbers exactly:

- 255,168 terminal sequences [1]: X wins 131,184 [2], O wins 77,904 [3], draws 46,080 [4].
- Leaf shares: X 51.411%, O 30.530%, draw 18.059%.
- Move-uniform random play: X 58.492%, O 28.810%, draw 12.698%.
- Perfect play: draw. All nine first moves have value "draw"; there is no winning first move.
- Max length 9; mean length over leaves 8.2545; uniform expectation 7.6262.
- 5,478 distinct reachable (board, turn) states; 549,946 nodes in the unfolded game tree.
- Length distribution of terminal sequences: 5 moves: 1,440; 6: 5,328; 7: 47,952; 8: 72,576;
  9: 127,872.
- Distinct terminal boards: 958 — 626 with an X line, 316 with an O line, **16 lineless full
  boards**; no board has both lines as a terminal state. This matches the UCI "Tic-Tac-Toe
  Endgame" database of 958 legal endgame boards [5].
- Of the 126 full 5X/4O boards, 110 contain at least one line and 16 contain none (the 16 draws).

### 2.2 The 16 lineless full boards, and why they force a design decision

All 16 lineless full boards are reachable in normal play; each is the terminal position of exactly
2,880 complete games, and 16 × 2,880 = 46,080 = the classic draw count. The boards are listed with
their sequence counts in the appendix output. This is the crux of the whole exercise: under the
standard win condition there are 46,080 reachable terminal positions (18.06% of all terminal
sequences) in which *neither player has won*, so **any variant that keeps the standard win
condition is forced to add a tiebreak for the filled board** (A, B, F) **or to change the win
condition** so that lineless full boards can no longer be terminal states (misère C/D, any-line E,
Maker–Breaker G, Notakto H). There is no third option.

### 2.3 Termination (all candidates)

Termination is structural, not probabilistic. A move occupies one previously empty cell; there is
no passing, no capture and no move that keeps the stone count equal. The solver asserts for every
edge of every tree that the child has exactly one more stone than its parent, so the reachable
state graph is a DAG graded by stone count: **no reachable cycle exists in any candidate**, and no
line of play can exceed 9 moves (E and H are bounded by 7, F by 8; see the table). The solver has
no recursion-depth or cycle guard because none is needed, and the exhaustive DFS terminated for
every rule.

### 2.4 Notes on the per-rule results

- **A** is the standard tree with all 46,080 draw leaves relabelled as X wins: X 177,264 /
  O 77,904. Perfect play is an X win from every opening (X's standard drawing strategy now wins).
- **B** relabels the 46,080 draws as O wins: X 131,184 / O 123,984. Perfect play is an O win:
  O's standard defensive strategy prevents X from ever completing a line, so the game ends either
  with O's line or a filled board, both O wins.
- **C** relabels misère's 46,080 draw leaves as X wins: X 123,984 / O 131,184. Perfect play X
  with the centre as the unique winning opening, matching the known centre + 180-degree mirror
  strategy [7]; see the mirror check below.
- **D** relabels them as O wins: X 77,904 / O 177,264. Perfect play O.
- **E** has a much smaller tree (max length 7) because any line that becomes fully occupied ends
  the game, including mixed X/O lines. X can win as early as move 3 (X at 0, O at 1, X at 2
  completes the top row) and O as early as move 4. Perfect play X from every opening; greedy play
  is a pure race in which X wins 100% of greedy-consistent lines, which shows how brittle the
  rule is under simple play.
- **F**: with O pre-placed, X has 5 stones and O 4, so the full-board last mover is X. F(i)
  (fill = X win) is a large O win; F(ii) (fill = O win) is an X win in which only the four corners
  are winning first moves, and O's free centre does not compensate. Greedy play flips the sign of
  F(i) vs F(ii) (X 4.2% vs 70.0%), so the handicap variant's outcome is dominated by the tiebreak,
  not by the handicap.
- **G** is Maker–Breaker 3x3 [8, 9]: Maker X wins with centre or any corner as a winning first
  move, exactly matching the published statement "the center vertex or any corner vertex is a
  winning first move for Maker" [8]. Under uniform random play X wins 77.8%, but under the greedy
  policy Breaker wins 65.9% of the time: blocking is easy and forking is hard, so Maker's
  advantage is real but not robust to weak play.
- **H** is single-board Notakto [6]: first player wins, unique winning first move is the centre,
  matching the published centre + knight's-move strategy; any other first move loses. Max length
  7, because any 7 occupied cells of the 3x3 board contain a line (two empty cells cannot block
  all eight lines), so the board can never fill and the game always ends by move 7.

### 2.5 Uniform random vs greedy vs leaves (why all three are reported)

The three "casual play" measures disagree, and the disagreement is informative. For B, the
move-uniform split is X 58.5 / O 41.5 but the leaf split is X 51.4 / O 48.6: long games are less
likely, and O's wins happen on average later. Under greedy play B is O-favoured (X 31.1), because
greedy players block lines and steer games to filled boards, which B awards to O. Anyone reading
these numbers to judge "balance" must say which distribution they mean. The move-uniform
distribution is the one a bored human approximates; the greedy distribution is the one a
beginner who knows "win or block" approximates.

### 2.6 Swap (pie) rule check

With the pie rule, X places one stone and O may either play on or swap (take the stone and hand the
move back). This was solved exhaustively for A and B, for all nine openings:

- Rule A: O can force a win for every opening (if A's value favours the player who did not move,
  O swaps and wins).
- Rule B: O can force a win for every opening (O simply plays on and wins).

So the pie rule does not produce theoretical balance in either candidate; it hands the forced win
to the second player. See §3.6 for the general argument and its sources.

---

## 3. Part 2: literature (primary sources)

Accessed 2026-09-21. Where a claim's owner could not be traced I say so in §4.

### 3.1 Classic game count and split

The oldest traceable owner of the numbers is Jim Ferry's computation, recorded in OEIS:

- **A061526**, *Number of complete games of n X n tic-tac-toe*: `1, 24, 255168, ...` — a(3) =
  255,168 [1].
- **A061527**, *won by X*: a(3) = 131,184 [2].
- **A061528**, *won by O*: a(3) = 77,904 [3].
- **A061529**, *ending in a draw*: a(3) = 46,080 [4].

All four are attributed to "Jim Ferry (jferry(AT)alum.mit.edu), May 04 2001", citing his page
"n X n tic-tac-toe (Mathematica programs followed by results)". These are the oldest owning
records I found; the number is widely repeated afterwards (e.g. an arXiv note on game-tree
estimation uses 255,168 and the split, citing a personal page [16]). I could not trace a
pre-2001 published owner. My own enumeration reproduces all four numbers exactly.

### 3.2 Perfect-play value of standard 3x3

Standard 3x3 is a draw with perfect play. I could not trace a single owning publication for this
folklore result: modern papers state it without proof (e.g. "The normal version of tic-tac-toe is
a solved game. It always ends up with draw if both players play their best" [7]) and textbooks
treat it as the standard example. Rely on the exhaustive minimax in the appendix: value = draw,
all nine openings draw. Cited sources: [7] states it; the computation here proves it.

### 3.3 The 958 terminal positions and the 16 lineless full boards

The UCI "Tic-Tac-Toe Endgame" database [5] is a complete set of legal endgame boards: "This
database encodes the complete set of possible board configurations at the end of tic-tac-toe
games... Number of Instances: 958 (legal tic-tac-toe endgame boards)... About 65.3% are positive
(i.e., wins for x)". The 16 draws within those 958, and the fact that every one is reachable, are
established by my own exhaustive enumeration (16 boards, 46,080 game sequences, 2,880 each). The
UCI file itself only labels positive/negative, so the 626/316/16 split is my classification of its
board set; it agrees with the 626 = 0.653 × 958 count implied by the dataset.

### 3.4 Misère tic-tac-toe (completing your own line loses)

Junan Pan, *Move first, and become unbeatable: Strategy study of different Tic-tac-toe*,
arXiv:2208.06795 (preprint) [7]:

> "The first player can always force a draw if he claims the center for the first move and then
> choose the square opposite of his opponent's choice. The first player always loses if he claims
> edge or corner first, because there is always a winning strategy for his opponent in that case."

> "To be emphasized, the only unbeatable way for the first player is described as above. If he
> starts with edge or corner, he always loses the game when facing a qualified opponent."

My exhaustive check of the strategy: X opens centre and thereafter plays the 180-degree rotation
of O's last move. Over all 360 legal O reply sequences in the untiebroken misère game, the result
is X 168 wins / O 0 wins / 192 draws — X never loses, and the perfect-play value is a draw, with
the centre the unique non-losing first move (0–3,5–8 all lose for X). If the lineless full board
is awarded to X (rule C), the same strategy wins all 360 lines; if it is awarded to O (rule D), O
wins 192 of the 360. So the misère game is a perfect-play draw, and every no-draw tiebreak converts
it into an all-or-nothing result; the mirror strategy is the reason C is a forced X win.

### 3.5 Notakto (both players place X, completing a line loses)

Plambeck & Whitehead, *The Secrets of Notakto: Winning at X-only Tic-Tac-Toe*, arXiv:1301.1672 [6],
quote the origin of the single-board result from the MathOverflow "Neutral tic tac toe" thread:

> "In the 3x3 misere game, the first player wins by playing in the center, and then wherever the
> second player plays, the first player plays a knight's move away from that."

and Kevin Buzzard's observation:

> "The reason any move other than the centre loses for [the first player to move] in the 3x3 game
> is that [the second player] can respond with a move diametrically opposite [the first player's]
> initial move. This makes the centre square unplayable, and then player two just plays the '180
> degree rotation' strategy which clearly wins."

The paper's own contribution is the disjunctive (multi-board) misère-quotient analysis; the
single-board case is exactly the game solved here as rule H. My exhaustive solve agrees on both
points: first player wins, unique winning first move = centre (4), and every other first move is a
second-player win. The paper's 18-element misère quotient for multi-board play was **not**
re-verified here.

### 3.6 Zermelo determinacy, and why perfect-play balance is impossible

The result usually called Zermelo's theorem was published as E. Zermelo, *Über eine Anwendung der
Mengenlehre auf die Theorie des Schachspiels*, Proc. Fifth International Congress of
Mathematicians (Cambridge 1912), CUP, 1913, 501–504 [10]; an English translation is in Schwalbe &
Walker, *Zermelo and the Early History of Game Theory*, Games and Economic Behavior 34(1), 2001,
123–137 [11]. A modern restatement: "in any such game either the first player has a winning
strategy, or the second player has a winning strategy, or both have unbeatable strategies"
(Amir & Evstigneev, *On Zermelo's theorem*, Journal of Dynamics and Games 4(3), 2017 [12]).

**Corollary used here.** In a finite perfect-information game with no draws, the third case is
impossible, so exactly one player has a forced win. A "50/50" perfect-play split cannot exist in
any no-draw variant; perfect-play win rates are 100/0 in favour of whichever side has the forced
win. "Balance" in the brief's sense can therefore only be *empirical* (random/greedy play, as in
the table) or a count of winning openings. Every candidate here has a forced winner: A, C, E, G, H
favour the first player; B, D, F(i) favour the second; F(ii) favours the first.

### 3.7 Pie/swap rule

The swap rule in Hex: after the first player's opening stone, the second player may instead swap
sides and take that stone. V. Anshelevich, *The Game of Hex: An Automatic Theorem Proving Approach
to Game Programming*, AAAI-2000, describes the opening move "also known as the swap rule" [14]. A
review of Hayward & Toft, *Hex: The Full Story*, in the Notices of the AMS 68(8), 2021 [15], says:

> "Normally pieces cannot be moved but one important exception used by most players is called the
> swap rule. On their first move the second player may move normally, or choose to swap their
> piece with that placed by the first player. This encourages the first player to only choose a
> moderately strong first move and so reduces any advantage of going first."

Gale's 1979 Monthly paper [13] owns Hex's no-draw property and its equivalence to the Brouwer
fixed-point theorem ("Hex... cannot end in a draw", opening line; the paper is a scan I could not
text-search). Whether Gale 1979 is also the owner of the swap rule — as the brief suggests — is
**unverified**; the earliest swap-rule reference I could confirm is the Hex literature above.

**The no-draw fairness argument, derived here and verified exhaustively.** In a symmetric no-draw
game with the pie rule, after X's opening stone at cell *c* the position is (by Zermelo) a forced
win for exactly one of the two roles: the player to move (O) or the player owning the stone (X).
If O is winning, O plays on; if X is winning, O swaps and takes the owner's role, which is then
winning. Either way, O has a forced win. Exhaustive solving confirms this for A and B: O can force
a win for every one of the nine openings. So the pie rule does not create theoretical fairness in a
no-draw game; it moves the forced win from the first player to the second. Its practical value is
that the first player must pick an opening that is neither too strong nor too weak, which balances
the *empirical* difficulty rather than the game-theoretic value.

---

## 4. Verdicts per candidate

| Candidate | Keep? | Reason |
|---|---|---|
| Standard | reject | 46,080 draw terminals (18.06% of sequences); fails the MUST |
| A | keep (second tier) | Simplest possible no-draw fix (one sentence); terminates by 9; but X wins 69.5% of leaves and every opening is a forced X win, so casual play is lopsided and skilled play is decided at move 1 |
| B | **keep (leading simple candidate)** | One sentence; no draws; terminates by 9; closest to even under both casual measures (leaves 51.4/48.6, move-uniform 58.5/41.5); caveat: perfect play is an O win, and greedy play favours O 68.9%, so "even" means even for near-random play, not for competent O |
| C | keep (alternative) | No draws; balanced casual play (leaves 48.6/51.4); but the misère wording is longer, and X has a short, teachable forced win (centre + 180-degree mirror) verified over all O replies |
| D | reject | Same forced winner as B (O) with much worse balance (28.8/71.2 move-uniform; greedy 13.7/86.3). Dominated by B |
| E | reject | No draws and very short games (max 7), but "win by making any line fully occupied" allows winning with a mixed line, is unlike tic-tac-toe, and greedy play is a degenerate X race (100%) |
| F(i) | reject | O 80.7% move-uniform, 95.8% greedy; handicap plus tiebreak is two extra rules and badly unbalanced. Dominated by B |
| F(ii) | reject | Extra pre-placement rule; perfect play X (corners only) and greedy X 70%, so the handicap does not produce balance; outcome is driven by the fill tiebreak |
| G | keep (reference) | No draws by definition; Maker X forced win; but asymmetric goals (O cannot win by a line) and greedy play favours Breaker 65.9%; useful as the formal "maker–breaker" option, less recognisable as tic-tac-toe |
| H | **keep (alternative, best casual balance)** | Simplest rule of all ("both players place X; the first to complete a line loses"), no draws, ends by move 7, near-even random play (first 48.4 / second 51.6); caveats: single-symbol (stretches "X and O alternating"), and first player has the known centre + knight's-move forced win [6] |

Shortlist for `docs/RULES.md`, in order of how well they fit "simple + recognisably tic-tac-toe +
balanced": **B**, then **A** (simplest wording, worse balance), then **H** (simplest rule, but
X-only), then **C** (misère flavour, balanced, but a known forced win for X). B and C are mirror
images in casual balance; B dominates D and the F variants.

---

## 5. Solver code (stdlib-only Python 3)

Save as `solver.py` and run `python3 solver.py`.

```python
#!/usr/bin/env python3
"""
no_draw_ttt.py -- exhaustive solvers for 3x3 tic-tac-toe no-draw rule sets.

Standard library only. Every number printed by this script is obtained by
enumerating the complete game tree (every legal sequence of moves, stopping
at terminal positions). Nothing is sampled.

Cell numbering:
    0 1 2
    3 4 5
    6 7 8
X moves first (rule F excepted: O is pre-placed on the centre).

Each rule is a function (board, last_mover) -> (terminal?, winner|None).
"""

from fractions import Fraction
from functools import lru_cache
from itertools import combinations

EMPTY, X, O = 0, 1, 2
SYM = {X: "X", O: "O", None: "draw"}


def other(p):
    return O if p == X else X


LINES = ((0, 1, 2), (3, 4, 5), (6, 7, 8),
         (0, 3, 6), (1, 4, 7), (2, 5, 8),
         (0, 4, 8), (2, 4, 6))


def mono(b, p):
    return any(b[i] == p and b[j] == p and b[k] == p for i, j, k in LINES)


def any_full_line(b):
    return any(b[i] != EMPTY and b[j] != EMPTY and b[k] != EMPTY
               for i, j, k in LINES)


def board_full(b):
    return all(c != EMPTY for c in b)


def nstones(b):
    return sum(1 for c in b if c != EMPTY)


# ---------------------------------------------------------------------------
# Terminal rules: (board, last_mover) -> (terminal?, winner or None)
# ---------------------------------------------------------------------------

def R_standard_draw(b, last):
    """Classic tic-tac-toe: a lineless full board is a draw."""
    if mono(b, X):
        return True, X
    if mono(b, O):
        return True, O
    if board_full(b):
        return True, None
    return False, None


def R_standard_fill_wins(b, last):
    """Rule A: standard lines; full board with no line -> last mover wins."""
    if mono(b, X):
        return True, X
    if mono(b, O):
        return True, O
    if board_full(b):
        return True, last
    return False, None


def R_standard_fill_loses(b, last):
    """Rule B: standard lines; full board with no line -> last mover loses."""
    if mono(b, X):
        return True, X
    if mono(b, O):
        return True, O
    if board_full(b):
        return True, other(last)
    return False, None


def R_misere_fill_wins(b, last):
    """Rule C: completing your own line loses; full board -> last mover wins."""
    if mono(b, last):
        return True, other(last)
    if mono(b, other(last)):        # unreachable in play; defensive
        return True, last
    if board_full(b):
        return True, last
    return False, None


def R_misere_fill_loses(b, last):
    """Rule D: completing your own line loses; full board -> last mover loses."""
    if mono(b, last):
        return True, other(last)
    if mono(b, other(last)):        # unreachable in play; defensive
        return True, last
    if board_full(b):
        return True, other(last)
    return False, None


def R_any_line(b, last):
    """Rule E: a move making any line fully occupied wins, whatever the symbols."""
    if any_full_line(b):
        return True, last
    return False, None


def R_misere_draw(b, last):
    """Misere with no fill tiebreak: a lineless full board is a draw."""
    if mono(b, last):
        return True, other(last)
    if mono(b, other(last)):        # unreachable in play; defensive
        return True, last
    if board_full(b):
        return True, None
    return False, None


def R_maker_breaker(b, last):
    """Rule G: X wins with an X line; O wins a filled board with no X line."""
    if mono(b, X):
        return True, X
    if board_full(b):
        return True, O
    return False, None


def R_notakto(b, last):
    """Rule H (Notakto, single board): both players place X; whoever
    completes a line of X's loses."""
    if mono(b, X):
        return True, other(last)
    return False, None


EMPTY9 = (EMPTY,) * 9
F_START = (EMPTY, EMPTY, EMPTY, EMPTY, O, EMPTY, EMPTY, EMPTY, EMPTY)


def value_function(rule, pieces=None):
    """Minimax value of any position: X, O or None (draw)."""
    pieces = pieces or {X: X, O: O}

    @lru_cache(maxsize=None)
    def value(b, turn):
        term, w = rule(b, other(turn))
        if term:
            return w
        vals = set()
        p = pieces[turn]
        for i in range(9):
            if b[i] == EMPTY:
                vals.add(value(b[:i] + (p,) + b[i + 1:], other(turn)))
        if turn in vals:
            return turn
        if None in vals:
            return None
        return other(turn)
    return value


def solve(rule, start=EMPTY9, start_turn=X, pieces=None):
    """Full exhaustive analysis of one rule set from one starting position."""
    pieces = pieces or {X: X, O: O}
    s0 = nstones(start)

    # (1) complete tree: terminal-leaf counts, exact lengths, and the exact
    #     outcome distribution under uniform random play.  Memo key is
    #     (board, turn); the previous mover is always other(turn).
    @lru_cache(maxsize=None)
    def rec(b, turn):
        term, w = rule(b, other(turn))
        if term:
            L = nstones(b) - s0
            counts = {X: 0, O: 0, None: 0}
            counts[w] = 1
            probs = {X: Fraction(0), O: Fraction(0), None: Fraction(0)}
            probs[w] = Fraction(1)
            return counts, L, L, probs, Fraction(L), 1
        legal = [i for i in range(9) if b[i] == EMPTY]
        assert legal, ("non-terminal full board reached: rule must declare "
                       "a full board terminal")
        m = len(legal)
        counts = {X: 0, O: 0, None: 0}
        probs = {X: Fraction(0), O: Fraction(0), None: Fraction(0)}
        mx = 0
        slen = 0
        elen = Fraction(0)
        nstates = 0
        for i in legal:
            nb = b[:i] + (pieces[turn],) + b[i + 1:]
            assert nstones(nb) == nstones(b) + 1      # graded DAG: no cycles
            c2, m2, s2, p2, e2, n2 = rec(nb, other(turn))
            for k2 in counts:
                counts[k2] += c2[k2]
            mx = max(mx, m2)
            slen += s2
            elen += e2 / m
            nstates += n2
            for k2 in probs:
                probs[k2] += p2[k2] / m
        return counts, mx, slen, probs, elen, nstates + 1

    counts, max_len, sum_len, prob, exp_len, nstates = rec(start, start_turn)
    total = counts[X] + counts[O] + counts[None]
    distinct_states = rec.cache_info().currsize

    # (2) exact outcome distribution under the greedy policy:
    #     win now if possible, else block the opponent's immediate win,
    #     else uniform at random.  Ties inside each set are uniform.
    @lru_cache(maxsize=None)
    def greedy(b, turn):
        term, w = rule(b, other(turn))
        if term:
            L = nstones(b) - s0
            counts_ = {X: 0, O: 0, None: 0}
            counts_[w] = 1
            probs_ = {X: Fraction(0), O: Fraction(0), None: Fraction(0)}
            probs_[w] = Fraction(1)
            return counts_, L, Fraction(L), probs_

        def play(bb, i, p):
            return bb[:i] + (pieces[p],) + bb[i + 1:]

        legal = [i for i in range(9) if b[i] == EMPTY]
        assert legal, ("non-terminal full board reached: rule must declare "
                       "a full board terminal")
        wins = []
        for i in legal:
            term2, w2 = rule(play(b, i, turn), turn)
            if term2 and w2 == turn:
                wins.append(i)
        if wins:
            cand = wins
        else:
            opp = other(turn)
            safe = []
            for i in legal:
                nb = play(b, i, turn)
                term2, w2 = rule(nb, turn)
                if term2:
                    continue            # move ends the game without winning
                threat = False
                for j in range(9):
                    if nb[j] == EMPTY:
                        term3, w3 = rule(play(nb, j, opp), opp)
                        if term3 and w3 == opp:
                            threat = True
                            break
                if not threat:
                    safe.append(i)
            cand = safe if safe else legal
        m = len(cand)
        counts_ = {X: 0, O: 0, None: 0}
        probs_ = {X: Fraction(0), O: Fraction(0), None: Fraction(0)}
        exp_ = Fraction(0)
        mx_ = 0
        for i in cand:
            c2, m2, e2, p2 = greedy(play(b, i, turn), other(turn))
            for k2 in counts_:
                counts_[k2] += c2[k2]
            for k2 in probs_:
                probs_[k2] += p2[k2] / m
            exp_ += e2 / m
            mx_ = max(mx_, m2)
        return counts_, mx_, exp_, probs_

    gcounts, gmax, gexp, gprob = greedy(start, start_turn)

    value = value_function(rule, pieces)
    first_values = {}
    for i in range(9):
        if start[i] == EMPTY:
            nb = start[:i] + (pieces[start_turn],) + start[i + 1:]
            first_values[i] = value(nb, other(start_turn))

    return {
        "counts": counts, "total": total, "max_len": max_len,
        "mean_len": Fraction(sum_len, total), "exp_len": exp_len,
        "prob": prob, "states": distinct_states, "tree_nodes": nstates,
        "value": value(start, start_turn),
        "first_values": first_values,
        "winning_first": sorted(i for i, v in first_values.items()
                                if v == start_turn),
        "greedy_counts": gcounts, "greedy_max": gmax, "greedy_mean": gexp,
        "greedy_prob": gprob,
    }


def fmt_pct(fr):
    return f"{float(fr) * 100:.3f}%"


def print_report(name, rule, start, start_turn, note, pieces=None):
    r = solve(rule, start, start_turn, pieces)
    c, t, p = r["counts"], r["total"], r["prob"]
    print("=" * 78)
    print(name)
    if note:
        print("  note:", note)
    print(f"  terminal lines of play (leaves) ... {t}")
    print(f"  X / O / draw leaves ............... {c[X]} / {c[O]} / {c[None]}")
    print(f"  leaf shares ....................... X {100 * c[X] / t:.3f}%  "
          f"O {100 * c[O] / t:.3f}%  draw {100 * c[None] / t:.3f}%")
    print(f"  uniform-random-play probabilities . X {fmt_pct(p[X])}  "
          f"O {fmt_pct(p[O])}  draw {fmt_pct(p[None])}")
    print(f"  game length: max {r['max_len']}, mean over leaves "
          f"{float(r['mean_len']):.4f}, uniform expectation "
          f"{float(r['exp_len']):.4f}")
    if r["winning_first"]:
        print(f"  perfect play ...................... {SYM[r['value']]}; "
              f"winning first moves {r['winning_first']}")
    else:
        print(f"  perfect play ...................... {SYM[r['value']]}; "
              f"no winning first move")
    fv = " ".join(f"{i}:{SYM[v]}" for i, v in sorted(r["first_values"].items()))
    print(f"  first-move values ................. {fv}")
    gp, gc = r["greedy_prob"], r["greedy_counts"]
    print(f"  greedy policy probabilities ....... X {fmt_pct(gp[X])}  "
          f"O {fmt_pct(gp[O])}  draw {fmt_pct(gp[None])}   "
          f"(greedy leaves X {gc[X]} / O {gc[O]} / draw {gc[None]})")
    print(f"  greedy length: max {r['greedy_max']}, expectation "
          f"{float(r['greedy_mean']):.4f}")
    print(f"  distinct (board, turn) states ..... {r['states']}   "
          f"(unfolded game-tree nodes {r['tree_nodes']})")
    return r


def standard_details():
    print("=" * 78)
    print("STANDARD BASELINE DETAIL (own line wins; lineless full board = draw)")
    term_counts = {}
    len_dist = {}

    def dfs(b, turn):
        term, w = R_standard_draw(b, other(turn))
        if term:
            term_counts[b] = term_counts.get(b, 0) + 1
            L = nstones(b)
            len_dist[L] = len_dist.get(L, 0) + 1
            return
        for i in range(9):
            if b[i] == EMPTY:
                dfs(b[:i] + (turn,) + b[i + 1:], other(turn))

    dfs(EMPTY9, X)
    total = sum(term_counts.values())
    print(f"  total terminal sequences: {total}")
    xb = sum(1 for b in term_counts if mono(b, X))
    ob = sum(1 for b in term_counts if mono(b, O))
    both = sum(1 for b in term_counts if mono(b, X) and mono(b, O))
    lnl = sum(1 for b in term_counts
              if board_full(b) and not mono(b, X) and not mono(b, O))
    print(f"  distinct terminal boards: {len(term_counts)} "
          f"(X-line {xb}, O-line {ob}, lineless full {lnl}, both {both})")
    print(f"  length distribution (length:sequences): "
          f"{dict(sorted(len_dist.items()))}")

    full_boards = list(combinations(range(9), 5))
    no_line = []
    for xs in full_boards:
        b = [O] * 9
        for i in xs:
            b[i] = X
        b = tuple(b)
        if not mono(b, X) and not mono(b, O):
            no_line.append(b)
    print(f"  full boards 5X/4O: {len(full_boards)}; with at least one line: "
          f"{len(full_boards) - len(no_line)}; lineless: {len(no_line)}")
    print("  lineless full boards and how many terminal sequences end on each:")
    for b in sorted(no_line, key=lambda bb: term_counts.get(bb, 0),
                    reverse=True):
        grid = "/".join("".join(".XO"[c] for c in b[r * 3:r * 3 + 3])
                        for r in range(3))
        n = term_counts.get(b, 0)
        print(f"    {grid}   sequences={n}   reachable={n > 0}")
    print("  every lineless full board reachable in normal play: "
          f"{all(term_counts.get(b, 0) > 0 for b in no_line)}")


def swap_check(name, rule):
    print("=" * 78)
    print(f"SWAP / PIE RULE CHECK: {name}")
    print("  X opens at cell c.  'O plays on' = value of ({c:X}, O to move);")
    print("  'O swaps' = value of ({c:O}, X to move), i.e. O took the stone.")
    value = value_function(rule)
    all_second = True
    for c in range(9):
        b_no = tuple(X if i == c else EMPTY for i in range(9))
        b_sw = tuple(O if i == c else EMPTY for i in range(9))
        v_no = value(b_no, O)
        v_sw = value(b_sw, X)
        second_wins = (v_no == O) or (v_sw == O)
        all_second &= second_wins
        print(f"    c={c}: O plays on -> {SYM[v_no]}; O swaps -> {SYM[v_sw]}; "
              f"O can force a win: {second_wins}")
    print(f"  second player wins with the swap rule for every opening: "
          f"{all_second}")


def mirror_check(rule, name):
    """X opens on the centre, then always plays the 180-degree rotation of
    O's last move.  Enumerate every legal O reply sequence."""
    outcomes = {X: 0, O: 0, None: 0}

    def rec(b, turn, last):
        term, w = rule(b, other(turn))
        if term:
            outcomes[w] += 1
            return
        if turn == X:
            m = 8 - last
            assert b[m] == EMPTY, (b, last)
            rec(b[:m] + (X,) + b[m + 1:], O, m)
        else:
            for i in range(9):
                if b[i] == EMPTY:
                    rec(b[:i] + (O,) + b[i + 1:], X, i)

    b0 = EMPTY9[:4] + (X,) + EMPTY9[5:]
    rec(b0, O, 4)
    tot = sum(outcomes.values())
    print(f"  mirror strategy vs {name}: exhaustive over all O replies")
    print(f"    (X centre, then rotate O's last move 180 degrees)")
    print(f"    X wins {outcomes[X]}, O wins {outcomes[O]}, draws "
          f"{outcomes[None]}  (total {tot})")


def main():
    ALL_X = {X: X, O: X}
    rules = [
        ("STANDARD baseline: own line wins; lineless full board = draw",
         R_standard_draw, EMPTY9, X, "the classic game", None),
        ("MISERE baseline (no fill tiebreak): completing your own line "
         "loses; lineless full board = draw",
         R_misere_draw, EMPTY9, X,
         "literature cross-check for the centre mirror strategy", None),
        ("A  own line wins; full board with no line -> last mover wins",
         R_standard_fill_wins, EMPTY9, X,
         "on a full 3x3 board the last mover is always X", None),
        ("B  own line wins; full board with no line -> last mover loses",
         R_standard_fill_loses, EMPTY9, X,
         "last mover loses is equivalent to O winning a filled board", None),
        ("C  misere: completing your own line loses; full board -> last "
         "mover wins",
         R_misere_fill_wins, EMPTY9, X,
         "a line result takes precedence over the fill tiebreak", None),
        ("D  misere: completing your own line loses; full board -> last "
         "mover loses",
         R_misere_fill_loses, EMPTY9, X,
         "a line result takes precedence over the fill tiebreak", None),
        ("E  any move that makes a line fully occupied wins, whatever the "
         "symbols",
         R_any_line, EMPTY9, X,
         "the first fully occupied line ends the game; its maker wins", None),
        ("F(i) O pre-placed on centre; standard lines; full board -> last "
         "mover wins",
         R_standard_fill_wins, F_START, X,
         "X has 5 stones, O 4, so the last mover on a full board is X", None),
        ("F(ii) O pre-placed on centre; standard lines; full board -> last "
         "mover loses",
         R_standard_fill_loses, F_START, X,
         "handicap variant of B", None),
        ("G  Maker-Breaker: X wins by an X line; O wins a filled board with "
         "no X line",
         R_maker_breaker, EMPTY9, X,
         "O lines are inert; this is Maker-Breaker on 3x3", None),
        ("H  Notakto single board: both players place X; completing a line "
         "loses",
         R_notakto, EMPTY9, X,
         "impartial misere tic-tac-toe; both players place X", ALL_X),
    ]
    for name, rule, start, turn, note, pieces in rules:
        print_report(name, rule, start, turn, note, pieces)
    standard_details()
    swap_check("rule A (standard + fill -> last mover wins)",
               R_standard_fill_wins)
    swap_check("rule B (standard + fill -> last mover loses)",
               R_standard_fill_loses)
    print("=" * 78)
    print("180-DEGREE MIRROR STRATEGY CHECKS (X opens centre, then mirrors)")
    mirror_check(R_misere_draw, "misere with no fill tiebreak")
    mirror_check(R_misere_fill_wins, "rule C (misere, fill -> last mover wins)")
    mirror_check(R_misere_fill_loses, "rule D (misere, fill -> last mover loses)")


if __name__ == "__main__":
    main()
```

## 6. Raw solver output (the numbers cited above)

```text
==============================================================================
STANDARD baseline: own line wins; lineless full board = draw
  note: the classic game
  terminal lines of play (leaves) ... 255168
  X / O / draw leaves ............... 131184 / 77904 / 46080
  leaf shares ....................... X 51.411%  O 30.530%  draw 18.059%
  uniform-random-play probabilities . X 58.492%  O 28.810%  draw 12.698%
  game length: max 9, mean over leaves 8.2545, uniform expectation 7.6262
  perfect play ...................... draw; no winning first move
  first-move values ................. 0:draw 1:draw 2:draw 3:draw 4:draw 5:draw 6:draw 7:draw 8:draw
  greedy policy probabilities ....... X 31.138%  O 17.381%  draw 51.481%   (greedy leaves X 9760 / O 3776 / draw 16064)
  greedy length: max 9, expectation 8.2992
  distinct (board, turn) states ..... 5478   (unfolded game-tree nodes 549946)
==============================================================================
MISERE baseline (no fill tiebreak): completing your own line loses; lineless full board = draw
  note: literature cross-check for the centre mirror strategy
  terminal lines of play (leaves) ... 255168
  X / O / draw leaves ............... 77904 / 131184 / 46080
  leaf shares ....................... X 30.530%  O 51.411%  draw 18.059%
  uniform-random-play probabilities . X 28.810%  O 58.492%  draw 12.698%
  game length: max 9, mean over leaves 8.2545, uniform expectation 7.6262
  perfect play ...................... draw; no winning first move
  first-move values ................. 0:O 1:O 2:O 3:O 4:draw 5:O 6:O 7:O 8:O
  greedy policy probabilities ....... X 13.722%  O 63.958%  draw 22.320%   (greedy leaves X 25344 / O 83520 / draw 46080)
  greedy length: max 9, expectation 8.8390
  distinct (board, turn) states ..... 5478   (unfolded game-tree nodes 549946)
==============================================================================
A  own line wins; full board with no line -> last mover wins
  note: on a full 3x3 board the last mover is always X
  terminal lines of play (leaves) ... 255168
  X / O / draw leaves ............... 177264 / 77904 / 0
  leaf shares ....................... X 69.470%  O 30.530%  draw 0.000%
  uniform-random-play probabilities . X 71.190%  O 28.810%  draw 0.000%
  game length: max 9, mean over leaves 8.2545, uniform expectation 7.6262
  perfect play ...................... X; winning first moves [0, 1, 2, 3, 4, 5, 6, 7, 8]
  first-move values ................. 0:X 1:X 2:X 3:X 4:X 5:X 6:X 7:X 8:X
  greedy policy probabilities ....... X 82.619%  O 17.381%  draw 0.000%   (greedy leaves X 34400 / O 3776 / draw 0)
  greedy length: max 9, expectation 8.2992
  distinct (board, turn) states ..... 5478   (unfolded game-tree nodes 549946)
==============================================================================
B  own line wins; full board with no line -> last mover loses
  note: last mover loses is equivalent to O winning a filled board
  terminal lines of play (leaves) ... 255168
  X / O / draw leaves ............... 131184 / 123984 / 0
  leaf shares ....................... X 51.411%  O 48.589%  draw 0.000%
  uniform-random-play probabilities . X 58.492%  O 41.508%  draw 0.000%
  game length: max 9, mean over leaves 8.2545, uniform expectation 7.6262
  perfect play ...................... O; no winning first move
  first-move values ................. 0:O 1:O 2:O 3:O 4:O 5:O 6:O 7:O 8:O
  greedy policy probabilities ....... X 31.138%  O 68.862%  draw 0.000%   (greedy leaves X 9760 / O 19840 / draw 0)
  greedy length: max 9, expectation 8.2992
  distinct (board, turn) states ..... 5478   (unfolded game-tree nodes 549946)
==============================================================================
C  misere: completing your own line loses; full board -> last mover wins
  note: a line result takes precedence over the fill tiebreak
  terminal lines of play (leaves) ... 255168
  X / O / draw leaves ............... 123984 / 131184 / 0
  leaf shares ....................... X 48.589%  O 51.411%  draw 0.000%
  uniform-random-play probabilities . X 41.508%  O 58.492%  draw 0.000%
  game length: max 9, mean over leaves 8.2545, uniform expectation 7.6262
  perfect play ...................... X; winning first moves [4]
  first-move values ................. 0:O 1:O 2:O 3:O 4:X 5:O 6:O 7:O 8:O
  greedy policy probabilities ....... X 26.474%  O 73.526%  draw 0.000%   (greedy leaves X 59904 / O 83520 / draw 0)
  greedy length: max 9, expectation 8.7887
  distinct (board, turn) states ..... 5478   (unfolded game-tree nodes 549946)
==============================================================================
D  misere: completing your own line loses; full board -> last mover loses
  note: a line result takes precedence over the fill tiebreak
  terminal lines of play (leaves) ... 255168
  X / O / draw leaves ............... 77904 / 177264 / 0
  leaf shares ....................... X 30.530%  O 69.470%  draw 0.000%
  uniform-random-play probabilities . X 28.810%  O 71.190%  draw 0.000%
  game length: max 9, mean over leaves 8.2545, uniform expectation 7.6262
  perfect play ...................... O; no winning first move
  first-move values ................. 0:O 1:O 2:O 3:O 4:O 5:O 6:O 7:O 8:O
  greedy policy probabilities ....... X 13.722%  O 86.278%  draw 0.000%   (greedy leaves X 25344 / O 129600 / draw 0)
  greedy length: max 9, expectation 8.8390
  distinct (board, turn) states ..... 5478   (unfolded game-tree nodes 549946)
==============================================================================
E  any move that makes a line fully occupied wins, whatever the symbols
  note: the first fully occupied line ends the game; its maker wins
  terminal lines of play (leaves) ... 23232
  X / O / draw leaves ............... 10368 / 12864 / 0
  leaf shares ....................... X 44.628%  O 55.372%  draw 0.000%
  uniform-random-play probabilities . X 51.587%  O 48.413%  draw 0.000%
  game length: max 7, mean over leaves 5.8471, uniform expectation 4.7698
  perfect play ...................... X; winning first moves [0, 1, 2, 3, 4, 5, 6, 7, 8]
  first-move values ................. 0:X 1:X 2:X 3:X 4:X 5:X 6:X 7:X 8:X
  greedy policy probabilities ....... X 100.000%  O 0.000%  draw 0.000%   (greedy leaves X 344 / O 0 / draw 0)
  greedy length: max 5, expectation 4.7778
  distinct (board, turn) states ..... 3202   (unfolded game-tree nodes 30442)
==============================================================================
F(i) O pre-placed on centre; standard lines; full board -> last mover wins
  note: X has 5 stones, O 4, so the last mover on a full board is X
  terminal lines of play (leaves) ... 25872
  X / O / draw leaves ............... 5616 / 20256 / 0
  leaf shares ....................... X 21.707%  O 78.293%  draw 0.000%
  uniform-random-play probabilities . X 19.286%  O 80.714%  draw 0.000%
  game length: max 8, mean over leaves 7.1892, uniform expectation 6.4357
  perfect play ...................... O; no winning first move
  first-move values ................. 0:O 1:O 2:O 3:O 5:O 6:O 7:O 8:O
  greedy policy probabilities ....... X 4.167%  O 95.833%  draw 0.000%   (greedy leaves X 128 / O 1760 / draw 0)
  greedy length: max 8, expectation 7.3583
  distinct (board, turn) states ..... 1837   (unfolded game-tree nodes 55505)
==============================================================================
F(ii) O pre-placed on centre; standard lines; full board -> last mover loses
  note: handicap variant of B
  terminal lines of play (leaves) ... 25872
  X / O / draw leaves ............... 10224 / 15648 / 0
  leaf shares ....................... X 39.518%  O 60.482%  draw 0.000%
  uniform-random-play probabilities . X 30.714%  O 69.286%  draw 0.000%
  game length: max 8, mean over leaves 7.1892, uniform expectation 6.4357
  perfect play ...................... X; winning first moves [0, 2, 6, 8]
  first-move values ................. 0:X 1:O 2:X 3:O 5:O 6:X 7:O 8:X
  greedy policy probabilities ....... X 70.000%  O 30.000%  draw 0.000%   (greedy leaves X 944 / O 480 / draw 0)
  greedy length: max 8, expectation 7.3583
  distinct (board, turn) states ..... 1837   (unfolded game-tree nodes 55505)
==============================================================================
G  Maker-Breaker: X wins by an X line; O wins a filled board with no X line
  note: O lines are inert; this is Maker-Breaker on 3x3
  terminal lines of play (leaves) ... 277920
  X / O / draw leaves ............... 197280 / 80640 / 0
  leaf shares ....................... X 70.984%  O 29.016%  draw 0.000%
  uniform-random-play probabilities . X 77.778%  O 22.222%  draw 0.000%
  game length: max 9, mean over leaves 8.6062, uniform expectation 8.0476
  perfect play ...................... X; winning first moves [0, 2, 4, 6, 8]
  first-move values ................. 0:X 1:O 2:X 3:O 4:X 5:O 6:X 7:O 8:X
  greedy policy probabilities ....... X 34.083%  O 65.917%  draw 0.000%   (greedy leaves X 21952 / O 43392 / draw 0)
  greedy length: max 9, expectation 8.6063
  distinct (board, turn) states ..... 5646   (unfolded game-tree nodes 686890)
==============================================================================
H  Notakto single board: both players place X; completing a line loses
  note: impartial misere tic-tac-toe; both players place X
  terminal lines of play (leaves) ... 23232
  X / O / draw leaves ............... 12864 / 10368 / 0
  leaf shares ....................... X 55.372%  O 44.628%  draw 0.000%
  uniform-random-play probabilities . X 48.413%  O 51.587%  draw 0.000%
  game length: max 7, mean over leaves 5.8471, uniform expectation 4.7698
  perfect play ...................... X; winning first moves [4]
  first-move values ................. 0:O 1:O 2:O 3:O 4:X 5:O 6:O 7:O 8:O
  greedy policy probabilities ....... X 62.822%  O 37.178%  draw 0.000%   (greedy leaves X 7680 / O 4920 / draw 0)
  greedy length: max 7, expectation 6.2078
  distinct (board, turn) states ..... 450   (unfolded game-tree nodes 30442)
==============================================================================
STANDARD BASELINE DETAIL (own line wins; lineless full board = draw)
  total terminal sequences: 255168
  distinct terminal boards: 958 (X-line 626, O-line 316, lineless full 16, both 0)
  length distribution (length:sequences): {5: 1440, 6: 5328, 7: 47952, 8: 72576, 9: 127872}
  full boards 5X/4O: 126; with at least one line: 110; lineless: 16
  lineless full boards and how many terminal sequences end on each:
    XXO/OXX/XOO   sequences=2880   reachable=True
    XXO/OOX/XXO   sequences=2880   reachable=True
    XXO/OOX/XOX   sequences=2880   reachable=True
    XOX/XXO/OXO   sequences=2880   reachable=True
    XOX/XOX/OXO   sequences=2880   reachable=True
    XOX/XOO/OXX   sequences=2880   reachable=True
    XOX/OXX/OXO   sequences=2880   reachable=True
    XOX/OOX/XXO   sequences=2880   reachable=True
    XOO/OXX/XXO   sequences=2880   reachable=True
    OXX/XXO/OOX   sequences=2880   reachable=True
    OXX/XOO/XOX   sequences=2880   reachable=True
    OXX/XOO/OXX   sequences=2880   reachable=True
    OXO/XXO/XOX   sequences=2880   reachable=True
    OXO/XOX/XOX   sequences=2880   reachable=True
    OXO/OXX/XOX   sequences=2880   reachable=True
    OOX/XXO/OXX   sequences=2880   reachable=True
  every lineless full board reachable in normal play: True
==============================================================================
SWAP / PIE RULE CHECK: rule A (standard + fill -> last mover wins)
  X opens at cell c.  'O plays on' = value of ({c:X}, O to move);
  'O swaps' = value of ({c:O}, X to move), i.e. O took the stone.
    c=0: O plays on -> X; O swaps -> O; O can force a win: True
    c=1: O plays on -> X; O swaps -> O; O can force a win: True
    c=2: O plays on -> X; O swaps -> O; O can force a win: True
    c=3: O plays on -> X; O swaps -> O; O can force a win: True
    c=4: O plays on -> X; O swaps -> O; O can force a win: True
    c=5: O plays on -> X; O swaps -> O; O can force a win: True
    c=6: O plays on -> X; O swaps -> O; O can force a win: True
    c=7: O plays on -> X; O swaps -> O; O can force a win: True
    c=8: O plays on -> X; O swaps -> O; O can force a win: True
  second player wins with the swap rule for every opening: True
==============================================================================
SWAP / PIE RULE CHECK: rule B (standard + fill -> last mover loses)
  X opens at cell c.  'O plays on' = value of ({c:X}, O to move);
  'O swaps' = value of ({c:O}, X to move), i.e. O took the stone.
    c=0: O plays on -> O; O swaps -> X; O can force a win: True
    c=1: O plays on -> O; O swaps -> X; O can force a win: True
    c=2: O plays on -> O; O swaps -> X; O can force a win: True
    c=3: O plays on -> O; O swaps -> X; O can force a win: True
    c=4: O plays on -> O; O swaps -> X; O can force a win: True
    c=5: O plays on -> O; O swaps -> X; O can force a win: True
    c=6: O plays on -> O; O swaps -> X; O can force a win: True
    c=7: O plays on -> O; O swaps -> X; O can force a win: True
    c=8: O plays on -> O; O swaps -> X; O can force a win: True
  second player wins with the swap rule for every opening: True
==============================================================================
180-DEGREE MIRROR STRATEGY CHECKS (X opens centre, then mirrors)
  mirror strategy vs misere with no fill tiebreak: exhaustive over all O replies
    (X centre, then rotate O's last move 180 degrees)
    X wins 168, O wins 0, draws 192  (total 360)
  mirror strategy vs rule C (misere, fill -> last mover wins): exhaustive over all O replies
    (X centre, then rotate O's last move 180 degrees)
    X wins 360, O wins 0, draws 0  (total 360)
  mirror strategy vs rule D (misere, fill -> last mover loses): exhaustive over all O replies
    (X centre, then rotate O's last move 180 degrees)
    X wins 168, O wins 192, draws 0  (total 360)
```

## 7. Unverified / could not trace

- **Owner of the perfect-play draw for standard 3x3**: not traced to a single owning
  publication. It is folklore/standard textbook material; the best I found is a preprint that
  states it [7]. What I tried: web search for solved-game sources, OEIS, the UCI dataset (which
  only labels endgames positive/negative), and the tic-tac-toe literature. My exhaustive minimax
  proves the result regardless.
- **Gale 1979 as the owner of the pie/swap rule**: unverified. What I tried: the only openly
  available copy I found (CMC mirror) is a page-image scan with no searchable text, and the
  Monthly copy is paywalled. The paper's stated result is Hex's no-draw property and its
  equivalence to Brouwer's theorem [13]; the swap rule's provenance is documented in the Hex
  literature [14, 15], not confirmed to Gale 1979. The general "pie rule gives the second player a
  win in a no-draw game" statement appears in non-primary sources (e.g. the Wikipedia "Pie rule"
  article); I therefore derived it here from Zermelo determinacy [10, 11, 12] and verified it
  exhaustively for rules A and B rather than citing a non-primary owner.
- **Pre-2001 owner of 255,168 and its split**: not traced. The oldest owning record I found is
  Ferry's computation deposited in OEIS in 2001 [1–4]; the number is repeated widely afterwards
  [16]. What I tried: OEIS searches on the individual numbers and the combination, and web
  searches for the original enumeration.
- **5,478 distinct reachable (board, turn) states and 549,946 game-tree nodes**: reproduced
  exactly here, but I did not find a primary source that owns these figures (they appear in course
  notes and papers without attribution, e.g. [17]). Treat the numbers as independently reproduced,
  owner unverified.
- **The 626/316/16 split of the 958 terminal boards**: the UCI dataset [5] owns the 958 count and
  the 65.3%-positive label; the X-line/O-line/lineless split is my classification and my
  enumeration. Consistent, but the split itself is not quoted from a primary source.
- **Notakto multi-board results**: the 18-element misère quotient and the multi-board outcomes in
  [6] were not re-verified; only the single-board case (rule H) was solved here. The Plambeck &
  Whitehead note is an arXiv preprint, not a peer-reviewed journal article.
- **arXiv:2208.06795 [7]** is a preprint (not peer-reviewed) and is used only as a statement of the
  known misère mirror strategy; the strategy itself was verified exhaustively here.
- **arXiv:2209.12819 [8]** is a preprint too; its tic-tac-toe statement matches my exhaustive G
  result exactly, which is why I rely on it. Beck's book [9] is the published authority for the
  Maker–Breaker framework, though I did not obtain a page-level quote for the 3x3 instance from it.

## References

1. OEIS A061526, *Number of complete games of n X n tic-tac-toe* (Jim Ferry, 4 May 2001).
   https://oeis.org/A061526 — accessed 2026-09-21.
2. OEIS A061527, *Number of complete games of n X n tic-tac-toe won by X* (Jim Ferry).
   https://oeis.org/A061527 — accessed 2026-09-21.
3. OEIS A061528, *Number of complete games of n X n tic-tac-toe won by O* (Jim Ferry).
   https://oeis.org/A061528 — accessed 2026-09-21.
4. OEIS A061529, *Number of complete games of n X n tic-tac-toe ending in a draw* (Jim Ferry).
   https://oeis.org/A061529 — accessed 2026-09-21.
5. D. W. Aha, *Tic-Tac-Toe Endgame* database, UCI Machine Learning Repository, 19 August 1991.
   `tic-tac-toe.names`: "Number of Instances: 958 (legal tic-tac-toe endgame boards)"; "About
   65.3% are positive (i.e., wins for x)". Accessed 2026-09-21.
6. T. E. Plambeck and G. Whitehead, *The Secrets of Notakto: Winning at X-only Tic-Tac-Toe*,
   arXiv:1301.1672, 2013. https://arxiv.org/abs/1301.1672 — accessed 2026-09-21.
7. Junan Pan, *Move first, and become unbeatable: Strategy study of different Tic-tac-toe*,
   arXiv:2208.06795, 2022. https://arxiv.org/abs/2208.06795 — accessed 2026-09-21.
8. F. Galliot, S. Gravier and I. Sivignon, *Maker-Breaker is solved in polynomial time on
   hypergraphs of rank 3*, arXiv:2209.12819 (v4, 2026). https://arxiv.org/abs/2209.12819 —
   accessed 2026-09-21.
9. J. Beck, *Combinatorial Games: Tic-Tac-Toe Theory*, Encyclopedia of Mathematics and its
   Applications 114, Cambridge University Press, 2008.
10. E. Zermelo, *Über eine Anwendung der Mengenlehre auf die Theorie des Schachspiels*, in
    Proceedings of the Fifth International Congress of Mathematicians (Cambridge 1912), Vol. 2,
    Cambridge University Press, 1913, 501–504.
11. U. Schwalbe and P. Walker, *Zermelo and the Early History of Game Theory*, Games and Economic
    Behavior 34(1), 2001, 123–137, doi:10.1006/game.2000.0794 (includes an English translation of
    Zermelo 1913).
12. R. Amir and I. V. Evstigneev, *On Zermelo's theorem*, Journal of Dynamics and Games 4(3),
    2017, 191–194, doi:10.3934/jdg.2017011.
13. D. Gale, *The Game of Hex and the Brouwer Fixed-Point Theorem*, American Mathematical Monthly
    86(10), 1979, 818–827.
14. V. Anshelevich, *The Game of Hex: An Automatic Theorem Proving Approach to Game Programming*,
    Proceedings of AAAI-2000.
15. Review of R. B. Hayward and B. Toft, *Hex: The Full Story*, Notices of the AMS 68(8), 2021,
    1345–. https://www.ams.org/notices/202108/rnoti-p1345.pdf — accessed 2026-09-21.
16. A. Yong and D. Yong, *An estimation method for game complexity*, arXiv:1901.11161, 2019
    (uses 255,168 and the split, citing a personal page).
17. Course notes and papers quoting 5,478 reachable positions and 549,946 tree nodes without a
    primary attribution; numbers independently reproduced in §2.1.
