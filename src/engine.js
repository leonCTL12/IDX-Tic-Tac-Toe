const LINES = Object.freeze([
  Object.freeze([0, 1, 2]),
  Object.freeze([3, 4, 5]),
  Object.freeze([6, 7, 8]),
  Object.freeze([0, 3, 6]),
  Object.freeze([1, 4, 7]),
  Object.freeze([2, 5, 8]),
  Object.freeze([0, 4, 8]),
  Object.freeze([2, 4, 6]),
]);

const EMPTY_BOARD = Object.freeze(new Array(9).fill(null));

function countMarks(cells) {
  let count = 0;
  for (const cell of cells) {
    if (cell !== null) count += 1;
  }
  return count;
}

function findLine(cells, mark) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (cells[a] === mark && cells[b] === mark && cells[c] === mark) return line;
  }
  return null;
}

export function createGame() {
  return Object.freeze({ cells: EMPTY_BOARD });
}

export function board(state) {
  return state.cells;
}

export function currentPlayer(state) {
  return countMarks(state.cells) % 2 === 0 ? 'X' : 'O';
}

export function legalMoves(state) {
  if (status(state).over) return [];
  const moves = [];
  for (let cell = 0; cell < 9; cell += 1) {
    if (state.cells[cell] === null) moves.push(cell);
  }
  return moves;
}

export function applyMove(state, cell) {
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) {
    throw new RangeError(`Illegal move: ${cell} is not a cell`);
  }
  if (status(state).over) {
    throw new Error('Illegal move: the game is over');
  }
  if (state.cells[cell] !== null) {
    throw new Error(`Illegal move: cell ${cell} is already occupied`);
  }
  const cells = state.cells.slice();
  cells[cell] = currentPlayer(state);
  return Object.freeze({ cells: Object.freeze(cells) });
}

export function status(state) {
  const moveCount = countMarks(state.cells);
  const xLine = findLine(state.cells, 'X');
  const oLine = findLine(state.cells, 'O');

  if (xLine !== null || oLine !== null) {
    return Object.freeze({
      over: true,
      winner: xLine !== null ? 'X' : 'O',
      reason: 'line',
      line: xLine !== null ? xLine : oLine,
      moveCount,
    });
  }

  if (moveCount === 9) {
    return Object.freeze({
      over: true,
      winner: 'O',
      reason: 'fill',
      line: null,
      moveCount,
    });
  }

  return Object.freeze({
    over: false,
    winner: null,
    reason: null,
    line: null,
    moveCount,
  });
}
