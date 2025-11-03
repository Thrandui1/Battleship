import {
  allowDrop,
  drag,
  dragEnd,
  drop,
  loadBoards,
  rotateShip,
  toggleHover,
  resetBoard,
  loadRandomShips,
  startGame,
  player,
  restartButton,
  hit,
} from './functions/dom-control.js';

loadBoards();
const cells = document.querySelectorAll('#grid-player .cell');
const ships = document.querySelectorAll('.ship');
const mousePos = { x: null, y: null };
const playerGrid = document.querySelector('#grid-player');
const randomButton = document.querySelector('#random-button');
const resetButton = document.querySelector('#reset-button');
const startButton = document.querySelector('#start-button');
const aiCells = document.querySelectorAll('#grid-computer .cell');

window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

cells.forEach((cell) => {
  cell.addEventListener('dragover', allowDrop);
  cell.addEventListener('drop', drop);
  cell.addEventListener('dragenter', toggleHover);
  cell.addEventListener('dragleave', toggleHover);
});

ships.forEach((ship) => {
  ship.addEventListener('dragstart', drag);
  ship.addEventListener('dragend', dragEnd);
  ship.addEventListener('click', rotateShip);
});

playerGrid.addEventListener('drag', (e) => e.preventDefault());

resetButton.addEventListener('click', resetBoard);
randomButton.addEventListener('click', loadRandomShips);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => location.reload());
aiCells.forEach((cell) => cell.addEventListener('click', hit));

const port = document.querySelector('.port');
const observerPort = new MutationObserver(() => {
  const cells = document.querySelectorAll('#grid-player .cell');
  const ships = document.querySelectorAll('.ship');
  const docks = document.querySelectorAll('.dock');
  docks.forEach((dock) => (dock.dataset.amount = `x${dock.childElementCount}`));

  cells.forEach((cell) => {
    cell.addEventListener('dragover', allowDrop);
    cell.addEventListener('drop', drop);
    cell.addEventListener('dragenter', toggleHover);
    cell.addEventListener('dragleave', toggleHover);
  });

  ships.forEach((ship) => {
    ship.addEventListener('dragstart', drag);
    ship.addEventListener('dragend', dragEnd);
    ship.addEventListener('click', rotateShip);
  });
});

observerPort.observe(port, { childList: true, subtree: true });

const observerGrid = new MutationObserver(() => {
  const startButton = document.querySelector('#start-button');
  if (player.gameboard.isShipsPlacedSuccessful()) {
    startButton.classList.remove('disabled-button');
    return;
  }

  startButton.classList.add('disabled-button');
});

observerGrid.observe(playerGrid, { childList: true, subtree: true });

