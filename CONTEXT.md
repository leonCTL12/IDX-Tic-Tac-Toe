# Tic-Tac-Toe, No Draws

A two-player tic-tac-toe variant whose entire reason to exist is that every game ends with a
winner: X moves first and must complete a line, and a board that fills with no line is awarded
to O.

## Language

**Board**:
The 3×3 grid of nine cells; together with whose turn it is, the whole state of a game.
_Avoid_: Grid, field

**Mark**:
An X or an O occupying a cell. X always moves first, so X places on moves 1, 3, 5, 7 and 9, and
O on moves 2, 4, 6 and 8.
_Avoid_: Piece, token, stone

**Line**:
Any of the eight triples of cells — three rows, three columns, two diagonals — in which a line
win can be completed. Use "row", "column" and "diagonal" only when the orientation matters.
_Avoid_: Three-in-a-row (as a name for the cells themselves)

**Line win**:
A player wins by placing a mark that completes a line of three of their own marks.
_Avoid_: Normal win, standard win

**Fill win**:
O wins because the board reaches nine marks with no line. At most one fill win can occur in a
game, and it is always X that has just moved, so a fill win is equivalently "the ninth move
loses".
_Avoid_: Draw-tiebreak, board-full win, stalemate

**Draw**:
A terminal position with no winner. This variant exists to make draws unreachable; a draw is
never a runtime outcome and must never be presented as one.
_Avoid_: Tie, stalemate

**Terminal**:
A position in which the game has ended — by either a line win or a fill win.

**Balance**:
Closeness of the two players' win rates. Two senses must not be conflated: *perfect-play
balance* is impossible in any no-draw variant, because exactly one player has a forced win,
while *empirical balance* is measured under a stated play policy (for example, uniform random
moves) and is the sense in which this variant is defended.
_Avoid_: Fairness
