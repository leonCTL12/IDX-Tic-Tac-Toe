# 02: Start a new game

**What to build:** A New Game control that returns the game to a completely fresh Board with X
to move. It resets from any state — mid-game or after either ending — leaving no Mark behind.
There is no separate reset path in the engine: New Game calls `createGame()` for a fresh State.

**Blocked by:** 01 (Take turns and reach both endings).

**Status:** ready-for-agent

- [ ] A New Game control is available while a game is in progress and after a game has ended.
- [ ] Starting a new game clears every Mark and sets X to move.
- [ ] A new game is a fresh State from `createGame()`; no earlier State is mutated or reused.
- [ ] Ending a game and starting a new one leaves the previous game's outcome unable to recur or bleed through.
