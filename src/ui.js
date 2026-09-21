import {
  createGame,
  board,
  currentPlayer,
  legalMoves,
  applyMove,
  status,
} from './engine.js';

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const newGameButton = document.getElementById('new-game');

const cellButtons = [];
let state = createGame();

for (let cell = 0; cell < 9; cell += 1) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cell';
  button.addEventListener('click', () => onCellClick(cell));
  boardElement.append(button);
  cellButtons.push(button);
}

function onCellClick(cell) {
  state = applyMove(state, cell);
  render();
}

function onNewGameClick() {
  state = createGame();
  render();
}

newGameButton.addEventListener('click', onNewGameClick);

function render() {
  const cells = board(state);
  const game = status(state);
  const playable = new Set(legalMoves(state));
  const winningLine = new Set(game.line ?? []);

  if (game.reason === 'fill') boardElement.dataset.outcome = 'fill';
  else boardElement.removeAttribute('data-outcome');

  for (let cell = 0; cell < 9; cell += 1) {
    const mark = cells[cell];
    const button = cellButtons[cell];
    button.textContent = mark ?? '';
    button.dataset.mark = mark ?? 'empty';
    button.dataset.highlight = winningLine.has(cell) ? 'true' : 'false';
    button.disabled = !playable.has(cell);
    button.setAttribute(
      'aria-label',
      mark === null ? `Cell ${cell + 1}` : `Cell ${cell + 1}: ${mark}`,
    );
  }

  statusElement.textContent = game.over ? announcement(game) : `${currentPlayer(state)} to move`;
}

function announcement(game) {
  if (game.reason === 'line') return `${game.winner} wins with a line.`;
  if (game.reason === 'fill') return `${game.winner} wins: the board filled with no line.`;
  return '';
}

render();
