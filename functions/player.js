import { Gameboard } from './gameboard.js';

export function Player(name) {
  const gameboard = Gameboard();
  const hits = new Set();

  return {
    name,
    gameboard,
    hits,
    isAttackPossible(coords) {
      const [x, y] = coords;
      if (hits.has(`${x}, ${y}`)) {
        return false;
      }
      return true;
    },
    attack(gameboard, coords) {
      const [x, y] = coords;
      if (!this.isAttackPossible(coords)) {
        return false;
      }
      hits.add(`${x}, ${y}`);
      gameboard.receiveAttack(coords);
      return true;
    },
    randomAttack(gameboard) {
      const coords = gameboard.getRandomCoords();
      if (!this.attack(gameboard, coords)) {
        this.randomAttack(gameboard);
      }
      return coords;
    },
  };
}