# Tic-Tac-Toe, No Draws — Rules

Two players, **X** and **O**, take turns on a 3×3 grid. **X moves first.** On your turn, place
your mark in any empty square. You may not pass, move a mark, or remove one.

## Winning

The first player to get **three of their own marks in a straight line** — any row, column, or
diagonal — wins immediately.

## The no-draw rule

**If all nine squares are filled and neither player has three in a row, O wins.**

In other words: X must win outright. If X never completes a line, O wins, either by completing a
line of O's own or by the board filling up.

## End of the game

A game ends in exactly two ways:

1. A player completes a line of three — that player wins.
2. The board fills with no line — O wins.

Every game therefore ends in at most nine moves, and every game has a winner.

## Notes

- If the ninth (final) move completes a line, the line wins. The no-draw rule applies only when
  the board fills with no line at all.
- The board below is full with no line for either player, so O wins:

  ```
  X O X
  O O X
  X X O
  ```
