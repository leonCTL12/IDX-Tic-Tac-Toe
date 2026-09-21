# 01: Take turns and reach both endings

**What to build:** The first playable path through the whole stack. Serving the repo with
`python3 -m http.server` and opening the page in Chrome gives a 3×3 board and shows whose turn
it is. A player places a Mark in an empty cell; X moves first and the players alternate; an
occupied cell refuses the move. A Line win ends the game and announces the winner and the Line
win reason. A Board that fills with no Line ends the game and announces O and the Fill win
reason. A Line completed on the ninth move is a Line win for its mover. Once the game is
Terminal, no further Mark can be placed. The rule engine is complete and pure, so no Draw is
representable and play can never hang.

All rule logic lives in the engine; the interface layer renders and forwards clicks only, and
performs no rule check of any kind. There is no New Game control yet (see ticket 02) and no
winning-Line highlight yet (see ticket 03).

The engine's public contract is decision-rich and was fixed in the design session; encode it
exactly rather than approximating it:

```
createGame()            -> State
board(state)            -> ReadonlyArray<'X' | 'O' | null>
currentPlayer(state)    -> 'X' | 'O'
legalMoves(state)       -> number[]                       // empty iff Terminal
applyMove(state, cell)  -> State                          // immutable; throws on illegal
status(state)           -> {
                             over: boolean,
                             winner: 'X' | 'O' | null,
                             reason: 'line' | 'fill' | null,
                             line: [number, number, number] | null,
                             moveCount: number
                           }
```

`State` is opaque to the interface layer, which must not read it directly. `reason: 'fill'` can
only ever accompany a win by O. `line` holds the three cells of a Line win and is `null` for a
Fill win.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `python3 -m http.server 8000` serves the game; opening it in current Chrome shows a 3×3 Board and whose turn it is.
- [ ] X moves first, the players alternate, and a Mark can be placed only in an empty cell; an occupied cell refuses the move without mutating State.
- [ ] Completing a Line of three of the mover's own Marks ends the game and announces that player as winner with the Line win reason.
- [ ] Filling all nine cells with no Line ends the game and announces O as winner with the Fill win reason.
- [ ] A Line completed on the ninth move is announced as a Line win for its mover, not a Fill win, and precedes the fill rule.
- [ ] At a Terminal position no Mark can be placed, and `legalMoves` is empty.
- [ ] The engine is DOM-free ESM; `applyMove` returns a new State and throws on an illegal move.
- [ ] The interface reads State only through the contract above and contains no rule check, so it cannot present a Draw.
- [ ] No build step, no dependencies, no network calls, no backend; browser-only ESM.
