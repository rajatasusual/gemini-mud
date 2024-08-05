/**
 * Class representing a game map.
 * @class
 */
class GameMap {
  /**
   * Constructs a new GameMap object.
   *
   * @param {number} size - The size of the game map.
   */
  constructor(size) {
    this.size = size;
    this.start = { x: 0, y: Math.floor(Math.random() * size) };
    this.end = { x: size - 1, y: Math.floor(Math.random() * size) };
    this.winPath = this.generateRandomWinPath();
    this.deadEndPaths = (size < 5) ? [] : this.generateDeadEndPaths();
    this.rooms = {};
  }


  /**
   * Generates a random valid path from the start cell to the end cell.
   *
   * @param {number} [mapSize=this.size] - The size of the map. Defaults to the size of the current instance.
   * @return {Array<Object>} The randomly generated win path.
   */
  generateRandomWinPath(mapSize = this.size) {
    const startCell = this.start;
    const endCell = this.end;

    const winPath = [startCell];

    let lastCell = startCell;

    // Logic to generate a random valid path from startCell to endCell
    while (lastCell.x !== endCell.x || lastCell.y !== endCell.y) {
      const possibleMoves = this.getValidMoves(lastCell, mapSize, winPath);
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      if (randomMove === undefined) {
        return this.generateRandomWinPath(mapSize);
      }
      winPath.push(randomMove);
      lastCell = randomMove;
    }

    return winPath;
  }

  /**
   * Generates dead-end paths branching off from the winning path.
   *
   * @param {Array} [winPath=this.winPath] - The winning path.
   * @param {number} [mapSize=this.size] - The size of the map.
   * @param {number} [maxDeadEndsPerBranch=2] - The maximum number of dead ends per branch.
   * @return {Array} An array of dead-end paths.
   */
  generateDeadEndPaths(winPath = this.winPath, mapSize = this.size, maxDeadEndsPerBranch = 2) {
    const deadEndPaths = [];
    const visited = new Set(winPath.map(cell => `${cell.x},${cell.y}`)); // Track visited cells

    for (let i = 0; i < winPath.length - 1; i++) { // Start from the second cell to avoid branching from the start
      const cell = winPath[i];
      const validMoves = this.getValidMoves(cell, mapSize, winPath);

      for (const move of validMoves) {
        if (!visited.has(`${move.x},${move.y}`)) { // Don't branch into existing paths
          let deadEndPath = [move];
          let currentCell = move;

          for (let j = 0; j < maxDeadEndsPerBranch; j++) { // Limit the length of each dead end branch
            const possibleMoves = this.getValidMoves(currentCell, mapSize, winPath.concat(deadEndPaths.flat(), deadEndPath));

            if (possibleMoves.length === 0) {
              break; // Dead end reached
            }

            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            deadEndPath.push(randomMove);
            currentCell = randomMove;
          }

          deadEndPaths.push(deadEndPath);
          deadEndPath.forEach(cell => visited.add(`${cell.x},${cell.y}`));
        }
      }
    }

    return deadEndPaths;
  }

  /**
   * Returns an array of valid moves for a given cell on a game map.
   *
   * @param {Object} cell - The current cell object with x and y coordinates.
   * @param {number} mapSize - The size of the game map.
   * @param {Array} winPath - An array of objects representing the winning path.
   * @return {Array} An array of objects representing the valid moves.
   */
  getValidMoves(cell, mapSize, winPath) {
    const moves = [];
    const directions = [
      { x: 1, y: 0 }, // Right
      { x: 0, y: 1 }, // Down
      { x: 0, y: -1 } // Up
    ];

    for (const dir of directions) {
      const newX = cell.x + dir.x;
      const newY = cell.y + dir.y;
      if (
        newX >= 0 &&
        newX < mapSize &&
        newY >= 0 &&
        newY < mapSize &&
        !winPath.some(c => c.x === newX && c.y === newY) // Avoid duplicates
      ) {
        moves.push({ x: newX, y: newY });
      }
    }

    return moves;
  }
  /**
   * Display the map with the win path, dead end paths, start point, and end point.
   *
   * @return {void} This function does not return anything.
   */
  display() {
    const map = Array.from({ length: this.size }, () => Array(this.size).fill(' '));

    for (const cell of this.winPath) {
      map[cell.y][cell.x] = '*';
    }

    for (const path of this.deadEndPaths) {
      for (const cell of path) {
        map[cell.y][cell.x] = '.';
      }
    }

    map[this.start.y][this.start.x] = 'S';
    map[this.end.y][this.end.x] = 'E';

    for (const row of map) {
      console.log(row.join(' | '));
      console.log('-'.repeat(this.size * 4 - 1));
    }
  }

  /**
   * Retrieves the cell at the specified coordinates.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @return {Object|null} The cell object with its type and exits, or null if the coordinates are out of bounds.
   */
  getCell(x, y) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
      return null; // Out of bounds
    }

    const cellType = this.getCellType(x, y);

    const exits = {
      north: y > 0 ? this.getCellType(x, y - 1) !== 'empty' : false,
      south: y < this.size - 1 ? this.getCellType(x, y + 1) !== 'empty' : false,
      east: x < this.size - 1 ? this.getCellType(x + 1, y) !== 'empty' : false,
      west: x > 0 ? this.getCellType(x - 1, y) !== 'empty' : false,
    };

    return {
      type: cellType,
      exits,
    };
  }

  /**
   * Returns the type of the cell at the given coordinates.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @return {string} The type of the cell: 'win' if it is part of the winning path, 'deadend' if it is part of a dead-end path, 'start' if it is the starting cell, 'end' if it is the ending cell, or 'empty' if it is an empty cell.
   */
  getCellType(x, y) {
    if (this.winPath.some(cell => cell.x === x && cell.y === y)) {
      return 'win';
    } else if (this.deadEndPaths.some(path => path.some(cell => cell.x === x && cell.y === y))) {
      return 'deadend';
    } else if (x === this.start.x && y === this.start.y) {
      return 'start';
    } else if (x === this.end.x && y === this.end.x) {
      return 'end';
    } else {
      return 'empty';
    }
  }

}

export default GameMap;