import { Player } from './player.js';
import { Ship } from './ship.js';
import { portHTML } from './patterns.js';

export const player = Player('player');
const ai = Player('ai');

const gridPlayer = document.querySelector('#grid-player');
const gridAi = document.querySelector('#grid-computer');
const dataTransferStatic = {
  previousCoords: [NaN],
  length: 0,
  class: '',
  isHorizontal: true,
};

const instruction = document.querySelector('.instruction');
const buttons = document.querySelector('.buttons');
const port = document.querySelector('.port');

const gameOverBg = document.querySelector('.game-over-bg');
const gameOverPlate = document.querySelector('.game-over');
const gameOverWinner = document.querySelector('.game-over__winner');
const playAgainButton = document.querySelector('.game-over__play-again');

export const restartButton = document.querySelector('.restart-button');

export function loadBoards() {
  const grid = document.querySelector('#grid-player');
  const gridComputer = document.querySelector('#grid-computer');
  grid.innerHTML = '';
  gridComputer.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    for (let k = 0; k < 10; k++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = i;
      cell.dataset.y = k;

      grid.append(cell);
      gridComputer.append(cell.cloneNode());
    }
  }
}

export function allowDrop(e) {
  e.preventDefault();
}

export function drag(e) {
  e.dataTransfer.setData('class', e.target.getAttribute('class'));
  e.dataTransfer.setData('length', e.target.getAttribute('data-length'));
  e.dataTransfer.setData('index', e.target.getAttribute('data-index'));
  e.dataTransfer.setData(
    'isHorizontal',
    e.target.getAttribute('data-isHorizontal')
  );

  dataTransferStatic.class = e.target.getAttribute('class');
  dataTransferStatic.length = +e.target.getAttribute('data-length');
  dataTransferStatic.isHorizontal = e.target.getAttribute('data-ishorizontal');

  if (e.target.closest('.cell')) {
    const coords = [
      +e.target.parentNode.dataset.x,
      +e.target.parentNode.dataset.y,
    ];
    e.dataTransfer.setData('prevCoords', [
      e.target.parentNode.dataset.x,
      e.target.parentNode.dataset.y,
    ]);

    dataTransferStatic.previousCoords = [
      +e.target.parentNode.dataset.x,
      +e.target.parentNode.dataset.y,
    ];

    player.gameboard.removeShip(coords);
  }
}

export function drop(e) {
  toggleHover(e);
  const itemIdex = e.dataTransfer.getData('index');
  const itemClass = dataTransferStatic.class;
  const length = dataTransferStatic.length;
  const coords = [
    +e.target.getAttribute('data-x'),
    +e.target.getAttribute('data-y'),
  ];
  const isHorizontal = dataTransferStatic.isHorizontal === 'true';

  if (
    e.target.classList.contains('ship') ||
    !player.gameboard.placeShip(Ship(length), coords, isHorizontal)
  ) {
    if (!isNaN(dataTransferStatic.previousCoords[0])) {
      player.gameboard.placeShip(
        Ship(length),
        dataTransferStatic.previousCoords,
        isHorizontal
      );
    }

    return;
  }
  e.target.append(
    document.querySelector(
      `.${itemClass.replace(/ /g, '.')}[data-index='${itemIdex}']`
    )
  );
}

export function dragEnd(e) {
  const rect = gridPlayer.getBoundingClientRect();
  const endX = rect.x + rect.width;
  const endY = rect.y + rect.height;

  if (
    e.clientX > endX ||
    e.clientX < rect.x ||
    e.clientY > endY ||
    e.clientY < rect.y
  ) {
    if (!isNaN(dataTransferStatic.previousCoords[0])) {
      const isHorizontal = dataTransferStatic.isHorizontal === 'true';

      player.gameboard.placeShip(
        Ship(dataTransferStatic.length),
        dataTransferStatic.previousCoords,
        isHorizontal
      );
    }
  }
}

export function toggleHover(e) {
  if (e.target.classList.contains('cell')) {
    e.target.classList.toggle('cell-hover');
  }
}

export function rotateShip(e) {
  const length = +e.target.getAttribute('data-length');
  if (!e.target.closest('.cell') || length === 1) {
    return;
  }

  const coords = [
    +e.target.parentNode.dataset.x,
    +e.target.parentNode.dataset.y,
  ];
  player.gameboard.removeShip(coords);
  const isHorizontal = e.target.dataset.ishorizontal === 'true';
  const qwe = 1 === 2;

  if (!player.gameboard.placeShip(Ship(length), coords, !isHorizontal)) {
    player.gameboard.placeShip(Ship(length), coords, isHorizontal);

    return;
  }

  e.target.dataset.ishorizontal = !isHorizontal;
}

function loadPort() {
  const port = document.querySelector('.port');

  port.innerHTML = '';
  port.innerHTML = portHTML;
}

export function resetBoard() {
  player.gameboard.clearBoard();
  loadBoards();
  loadPort();
}

export function loadRandomShips() {
  resetBoard();
  player.gameboard.placeRandomShips();

  const board = player.gameboard.board;
  const cells = [...document.querySelectorAll('#grid-player .cell')];
  const prevShips = [];

  for (let i = 0; i < 10; i++) {
    for (let k = 0; k < 10; k++) {
      if (board[i][k] === 0) {
        continue;
      }

      const ship = board[i][k];
      if (prevShips.includes(ship)) {
        continue;
      }

      prevShips.push(ship);
      const cell = cells.find(
        (cell) => +cell.dataset.x === i && +cell.dataset.y === k
      );

      const shipDOM = document.querySelector(
        `.d${ship.length}`
      ).firstElementChild;

      shipDOM.dataset.ishorizontal = `${ship.isHorizontal}`;

      cell.appendChild(shipDOM);
    }
  }
}

export function startGame() {
  if (!player.gameboard.isShipsPlacedSuccessful()) {
    return;
  }
  const aiCells = document.querySelectorAll('#grid-computer .cell');
  aiCells.forEach((cell) => cell.addEventListener('click', hit));

  gridAi.classList.remove('draggable-off');
  gridPlayer.innerHTML += ` <div class="disable-grid"></div>`;
  const ships = document.querySelectorAll('div.ship');

  instruction.classList.add('hide-element');
  buttons.classList.add('hide-element');
  port.classList.add('hide-element');
  restartButton.classList.add('enabled-button');

  ships.forEach((ship) => {
    ship.removeAttribute('draggable');
    ship.classList.add('draggable-off');
  });

  ai.gameboard.placeRandomShips();
}

export function hit(e) {
  const [aiX, aiY] = [+e.target.dataset.x, +e.target.dataset.y];

  if (!player.attack(ai.gameboard, [aiX, aiY])) {
    return;
  }

  const playerCells = [...document.querySelectorAll('#grid-player .cell')];
  const aiCells = [...document.querySelectorAll('#grid-computer .cell')];

  aiCells
    .find((cell) => +cell.dataset.x === aiX && +cell.dataset.y === aiY)
    .classList.add(
      `${typeof ai.gameboard.board[aiX][aiY] === 'object' ? 'hit' : 'missed'}`
    );

  const [plX, plY] = ai.randomAttack(player.gameboard);
  playerCells
    .find((cell) => +cell.dataset.x === plX && +cell.dataset.y === plY)
    .classList.add(
      `${
        typeof player.gameboard.board[plX][plY] === 'object'
          ? 'hit-player'
          : 'missed'
      }`
    );

  if (typeof ai.gameboard.board[aiX][aiY] === 'object') {
    if (ai.gameboard.board[aiX][aiY].isSunk()) {
      surroundShipWithMissesDOM([aiX, aiY], ai.gameboard.board, aiCells);
    }
  }
  if (typeof player.gameboard.board[plX][plY] === 'object') {
    if (player.gameboard.board[plX][plY].isSunk()) {
      surroundShipWithMissesDOM(
        [plX, plY],
        player.gameboard.board,
        playerCells
      );
    }
  }

  if (!ai.gameboard.isGameOver() && !player.gameboard.isGameOver()) {
    return;
  }
  gameOverBg.classList.add('game-over-visible');
  gameOverPlate.classList.add('game-over-visible');
  playAgainButton.addEventListener('click', () => location.reload());

  if (ai.gameboard.isGameOver()) {
    gameOverWinner.textContent = 'Вы выйграли';
  } else {
    gameOverWinner.textContent = 'The winner is computer';
  }
}


export function surroundShipWithMissesDOM(coordsHit, board, cells) {
  const ship = board[coordsHit[0]][coordsHit[1]];
  const coords = ship.coords[0];
  const length = ship.length;
  const isHorizontal = ship.isHorizontal;
  let offX = coords[0] - 1;
  let offY = coords[1] - 1;
  let count = 0;
  const areaLength = (length + 2) * 3;

  if (isHorizontal) {
    for (let i = 0; i < areaLength; i++) {
      if (count > areaLength / 3 - 1) {
        count = 0;
        offX++;
        offY = coords[1] - 1;
      }

      try {
        if (board[offX][offY] === 'x' || board[offX][offY] === undefined) {
          offY++;
          count++;

          continue;
        }
        cells
          .find((cell) => +cell.dataset.x === offX && +cell.dataset.y === offY)
          .classList.add('missed');
        offY++;
        count++;
      } catch (e) {
        offY++;
        count++;

        continue;
      }
    }

    return true;
  } else if (!isHorizontal) {
    for (let i = 0; i < areaLength; i++) {
      if (count > areaLength / 3 - 1) {
        count = 0;
        offY++;
        offX = coords[0] - 1;
      }
      try {
        if (board[offX][offY] === 'x' || board[offX][offY] === undefined) {
          offX++;
          count++;

          continue;
        }
        cells
          .find((cell) => +cell.dataset.x === offX && +cell.dataset.y === offY)
          .classList.add('missed');
        offX++;
        count++;
      } catch (e) {
        offX++;
        count++;

        continue;
      }
    }
    return true;
  }
}