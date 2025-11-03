export function Ship(length) {
  return {
    length,
    hitCount: 0,
    sunk: false,
    coords: [],
    getLength() {
      return length;
    },
    hit() {
      this.hitCount += 1;
    },
    isSunk() {
      return (this.sunk = this.getLength() === this.hitCount);
    },
  };
}