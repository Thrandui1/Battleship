import { Ship } from './ship.js';

export function Gameboard() {
  const SIZE = 10;
  const board = createBoard();
  // let gameOver = false;
  let ships = 0;

  function createBoard() {
    let board = [];
    for (let i = 0; i < SIZE; i++) {
      board[i] = [];
      for (let k = 0; k < SIZE; k++) {
        board[i].push(0);
      }
    }
    return board;
  }

  return {
    board,
    ships,
    // gameOver,
    clearBoard() {
      for (let i = 0; i < SIZE; i++) {
        this.board[i] = [];
        for (let k = 0; k < SIZE; k++) {
          this.board[i].push(0);
        }
      }
    },
    getRandomCoords() {
      return [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
    },
    getBoard() {
      return board;
    },
    placeShip(ship, coords, isHorizontal = true) {
      const shipEndX = coords[1] + ship.getLength() - 1;
      const shipEndY = coords[0] + ship.getLength() - 1;
      const endCoordsX = [coords[0], shipEndX];
      const endCoordsY = [shipEndY, coords[1]];

      if (!this.isPlacementPossible(ship.length, coords, isHorizontal)) {
        return false;
      }

      ship.isHorizontal = isHorizontal;
      ship.coords.push(coords);

      const [x, y] = isHorizontal ? [0, 1] : [1, 0];

      for (let i = 0; i < ship.getLength(); i++) {
        this.board[coords[0] + i * x][coords[1] + i * y] = ship;
      }
      this.ships++;
      ship.coords.push(isHorizontal ? endCoordsX : endCoordsY);

      return true;

      // if (isHorizontal) {
      //   for (let i = 0; i < ship.getLength(); i++) {
      //     this.board[coords[0]][coords[1] + i] = ship;
      //   }
      //   this.ships++;
      //   ship.coords.push(endCoordsX);

      //   return true;
      // } else if (!isHorizontal) {
      //   for (let i = 0; i < ship.getLength(); i++) {
      //     this.board[coords[0] + i][coords[1]] = ship;
      //   }
      //   this.ships++;
      //   ship.coords.push(endCoordsY);

      //   return true;
      // }
    },

    isPlacementPossible(length, coords, isHorizontal) {
      let offX = coords[0] - 1;
      let offY = coords[1] - 1;
      let count = 0;
      const areaLength = (length + 2) * 3;
      const shipEndX = coords[1] + length - 1;
      const shipEndY = coords[0] + length - 1;

      if (isHorizontal) {
        if (shipEndX > 9) {
          return false;
        }

        for (let i = 0; i < areaLength; i++) {
          if (count > areaLength / 3 - 1) {
            count = 0;
            offX++;
            offY = coords[1] - 1;
          }

          try {
            if (typeof this.board[offX][offY] === 'object') {
              return false;
            }
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
        if (shipEndY > 9) {
          return false;
        }
        for (let i = 0; i < areaLength; i++) {
          if (count > areaLength / 3 - 1) {
            count = 0;
            offY++;
            offX = coords[0] - 1;
          }
          try {
            if (typeof this.board[offX][offY] === 'object') {
              return false;
            }
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
    },

    receiveAttack(coords) {
      const [x, y] = coords;
      const cell = this.board[x][y];

      if (typeof this.board[x][y] === 'object') {
        this.board[x][y].hit();

        if (cell.isSunk()) {
          this.ships--;

          this.surroundShipWithMisses(
            cell.length,
            cell.coords[0],

            cell.isHorizontal
          );
        }
      } else {
        this.board[x][y] = '*';
      }
    },
    isGameOver() {
      if (this.ships === 0) {
        return true;
      }
    },
    surroundShipWithMisses(length, coords, isHorizontal) {
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
            if (
              typeof this.board[offX][offY] === 'object' ||
              this.board[offX][offY] === undefined
            ) {
              offY++;
              count++;

              continue;
            }
            this.board[offX][offY] = '*';
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
            if (
              typeof this.board[offX][offY] === 'object' ||
              this.board[offX][offY] === undefined
            ) {
              offX++;
              count++;

              continue;
            }
            this.board[offX][offY] = '*';
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
    },
    placeRandomShips() {
      const lengths = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
      const ships = lengths.map((l) => Ship(l));

      let successfulPlacement = 0;

      while (successfulPlacement < lengths.length) {
        const coords = this.getRandomCoords();
        const isHorizontal = Math.random() < 0.5;

        if (this.placeShip(ships[successfulPlacement], coords, isHorizontal)) {
          successfulPlacement++;
        }
      }
    },
    isShipsPlacedSuccessful() {
      let count = 0;

      for (let i = 0; i < SIZE; i++) {
        for (let k = 0; k < SIZE; k++) {
          if (typeof this.board[i][k] !== 'object') {
            count++;
          }
        }
      }

      return count === 80 ? true : false;
    },
    removeShip(coords) {
      const ship = this.board[coords[0]][coords[1]];
      const endCoords = ship.coords[1];
      if (coords[0] === endCoords[0]) {
        for (let i = 0; i < ship.length; i++) {
          this.board[coords[0]][coords[1] + i] = 0;
        }
      } else if (coords[1] === endCoords[1]) {
        for (let i = 0; i < ship.length; i++) {
          this.board[coords[0] + i][coords[1]] = 0;
        }
      }
    },
  };
}