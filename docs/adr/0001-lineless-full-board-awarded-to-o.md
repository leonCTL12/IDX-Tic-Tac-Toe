# A lineless full board is awarded to O

## Status

accepted

## Context

Standard 3×3 tic-tac-toe ends in a draw on a full board with no line: 46,080 of its 255,168
lines of play (18.06%) end that way. The brief forbids any draw, so any variant that keeps the
standard line win is forced to decide who gets that position. There is no third option:
either add a tiebreak for the lineless full board, or change the win condition so it can no
longer be terminal.

## Decision

Keep the standard line win, and award the lineless full board to O. Because X moves first and
nine is odd, the ninth move is always X's, so this is equivalently "the ninth move loses".

## Considered Options

- **Award the board to X (last mover wins)** — the simplest possible fix, but X wins 69.5% of
  lines of play and every one of the nine openings is a forced X win. Rejected as lopsided.
- **Misère variants (completing your own line loses)** — balanced, but the wording is longer,
  the win condition is no longer recognisably tic-tac-toe, and with the tiebreak the first
  player has a short, teachable forced win (centre plus 180° mirror). Rejected in favour of a
  smaller change.
- **Notakto (both players place X; completing a line loses)** — the simplest rule and the best
  casual balance, but it uses a single symbol and therefore stretches "X and O alternating".
  Rejected.
- **Handicap variants (O pre-placed on the centre)** — two extra rules, and the fill tiebreak
  still dominates the outcome; the handicap does not balance. Rejected.

The exhaustive comparison behind this decision is in
[../research/no-draw-variants.md](../research/no-draw-variants.md); the compact rule is in
[../RULES.md](../RULES.md).

## Consequences

- Every terminal position has a winner, and no line of play exceeds nine moves.
- Perfect play is an O win. In a finite perfect-information game with no draws exactly one
  player has a forced win, so this is unavoidable for any no-draw variant — it is not a defect
  specific to this choice.
- "Balance" therefore holds empirically, not at perfect play: under uniform random play the
  split is X 58.5% / O 41.5%, and by terminal sequence 51.4% / 48.6%. Under a greedy
  win-or-block policy O wins 68.9%, so the variant must not be described as balanced for
  competent play.
