const Describer = require("./describer.js").default;
const relayMessage = require("./logger").default;
const RoomGenerator = require("./room-generator.js").default;

let dotenv;
if (typeof window === "undefined") {
  dotenv = require("dotenv");
  dotenv.config();
}

const LOG = typeof process !== "undefined" && process.env ? process.env.LOG === "true" : window.LOG === true;
const GENERATE = typeof process !== "undefined" && process.env ? process.env.GENERATE === "true" : window.GENERATE === true;

/**
 * GameEngine class implements the game logic.
 *
 * @class
 * @author Rajat Kumar
 * @see https://rajatasusual.github.io/gemini-mud/
 */
class GameEngine {
  /**
   * Creates a new instance of the GameEngine class.
   *
   * @param {Object} gameMap - The game map object.
   * @return {Promise<GameEngine>} A promise that resolves to the initialized GameEngine instance.
   */
  constructor(gameMap) {
    this.gameMap = gameMap;
    this.roomGenerator = new RoomGenerator(); // Instantiate the RoomGenerator
    this.describer = new Describer();
    return (async () => {
      await this.init();

      return this;
    })();
  }

  /**
   * Initializes the player object and generates the first room if GENERATE is true.
   *
   * @return {Promise<void>} A Promise that resolves when the initialization is complete.
   */
  async init() {
    this.player = {
      x: this.gameMap.start.x,
      y: this.gameMap.start.y,
      pathTaken: [{ x: this.gameMap.start.x, y: this.gameMap.start.y }], // Initialize pathTaken
      inventory: [],
    };

    // Generate the first room
    if (GENERATE) {
      await this.generateRoomAndUpdateMap(this.player.x, this.player.y);
      await this.look();
    }
  }

  /**
   * Asynchronously generates a room at the specified coordinates and updates the game map.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @return {Promise<void>} A promise that resolves when the room is generated and the game map is updated. Returns null if the cell is already occupied.
   */
  async generateRoomAndUpdateMap(x, y) {
    const cellInfo = this.gameMap.getCell(x, y);
    if (this.gameMap.rooms[`${x},${y}`] === undefined) {
      // Generate the room
      const room = await this.roomGenerator.generateRoom(cellInfo);
      this.updateIDs(room);
      const narration = await this.describer.describeRoom(room);

      room["narration"] = narration;

      // Update the gameMap
      this.gameMap.rooms[`${x},${y}`] = room;
      //update cellInfo
      cellInfo.room = room;
    } else {
      if (LOG) {
        relayMessage("Cell is already occupied.");
      }
      return null; // Or throw an error
    }
  }


  updateIDs(room) {
    room._id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    for (let i = 0; i < room.exits.length; i++) {
      room.exits[i]._id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
  }

  /**
 * Generates nodes and links for D3 visualization.
 * @return {Object} An object containing nodes and links arrays for D3.
 */
  generateD3Data() {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    const nodeIdMap = new Map(); // Maps coordinate to node object for quick reference

    // Function to add a node if it doesn't exist
    const addNode = (room) => {
      const id = room._id;
      if (!nodeMap.has(id)) {
        const node = { id, label: room.name };
        nodeMap.set(id, node);
        nodeIdMap.set(id, node);
        nodes.push(node);
      }
    };

    // Function to add a link if it doesn't exist
    const addLink = (sourceRoom, targetRoom) => {
      const sourceNode = nodeIdMap.get(sourceRoom._id);
      const targetNode = nodeIdMap.get(targetRoom._id);
      if (sourceNode && targetNode) {
        links.push({ source: sourceNode.id, target: targetNode.id });
      }
    };

    // Add nodes and links for the path taken
    for (let i = 0; i < this.player.pathTaken.length; i++) {
      const cell = this.player.pathTaken[i];
      addNode(this.gameMap.rooms[`${cell.x},${cell.y}`]);

      if (i > 0) {
        const prevCell = this.player.pathTaken[i - 1];
        addLink(this.gameMap.rooms[`${prevCell.x},${prevCell.y}`], this.gameMap.rooms[`${cell.x},${cell.y}`]);
      }
    }

    return { nodes, links };
  }

  /**
   * Displays the path taken by the player on the game map using arrows.
   *
   * @return {void} This function does not return anything.
   */
  showPathTaken() {
    const map = Array.from({ length: this.gameMap.size }, () =>
      Array(this.gameMap.size).fill(" ")
    );

    // Mark path with arrows
    for (let i = 0; i < this.player.pathTaken.length; i++) {
      const cell = this.player.pathTaken[i];
      if (i === 0) {
        map[cell.y][cell.x] = "S"; // Start
      } else {
        const prevCell = this.player.pathTaken[i - 1];
        if (cell.x > prevCell.x) {
          map[cell.y][cell.x] = "→"; // East
        } else if (cell.x < prevCell.x) {
          map[cell.y][cell.x] = "←"; // West
        } else if (cell.y > prevCell.y) {
          map[cell.y][cell.x] = "↓"; // South
        } else if (cell.y < prevCell.y) {
          map[cell.y][cell.x] = "↑"; // North
        }
      }
    }

    // Display map
    for (const row of map) {
      relayMessage(row.join(" "));
    }
  }


  /**
   * Executes a command based on the given command and argument.
   *
   * @param {string} command - The command to execute.
   * @param {string} arg - The argument for the command.
   * @return {Promise<void>} A promise that resolves when the command is executed.
   */
  async executeCommand(command, arg) {
    switch (command) {
      case "look":
        await this.look();
        break;
      case "move":
      case "go":
        await this.move(arg);
        break;
      case "take":
        this.takeItem(arg);
        break;
      case "use":
        this.useItem(arg);
        break;
      case "talk":
        this.talkToNPC(arg);
        break;
      case "inventory":
        this.showInventory();
        break;
      case "quit":
        this.quit();
        break;
      default:
        relayMessage("Invalid command.");
        break;
    }
  }

  /**
   * Get the current room based on player's position and display the room description.
   *
   * @return {void} This function does not return anything.
   */
  async look() {
    // Get the current room based on player's position
    const currentRoom = this.gameMap.rooms[`${this.player.x},${this.player.y}`];

    if (!currentRoom) {
      relayMessage("There's nothing here.");
      return;
    }

    if (!currentRoom["narration"] && GENERATE) {
      const narration = await this.describer.describeRoom(currentRoom);
      currentRoom["narration"] = narration;
    }

    // Display room description (you might need to parse JSON here)
    relayMessage(currentRoom["narration"]);
  }

  /**
   * Move the player in the specified direction.
   *
   * @param {string} direction - The direction to move the player. Valid directions are "north", "south", "east", and "west".
   * @return {Promise<void>} A promise that resolves when the player has moved or rejects if the direction is invalid.
   */
  async move(direction) {
    // Check if the direction is valid and there's an exit
    const exits = this.gameMap.getCell(this.player.x, this.player.y).exits;
    if (exits[direction]) {
      // Update player position based on direction
      switch (direction) {
        case "north":
          this.player.y--;
          break;
        case "south":
          this.player.y++;
          break;
        case "east":
          this.player.x++;
          break;
        case "west":
          this.player.x--;
          break;
      }
      // Generate the room if it hasn't been generated yet
      if (!this.gameMap.rooms[`${this.player.x},${this.player.y}`] && GENERATE) {
        await this.generateRoomAndUpdateMap(this.player.x, this.player.y);
      }

      this.player.pathTaken.push({ x: this.player.x, y: this.player.y }); // Add new position to pathTaken
      relayMessage(`You move ${direction}.\n`);
      LOG && this.showPathTaken();

      await this.look(); // Automatically look around after moving

      if (this.player.x === this.gameMap.end.x && this.player.y === this.gameMap.end.y) {
        await this.endGame();
      }

    } else {
      relayMessage("You can't go that way.");
    }
  }

  /**
   * Takes an item from the room and adds it to the player's inventory.
   *
   * @param {string} itemName - The name of the item to be taken.
   * @return {void} This function does not return a value.
   */
  takeItem(itemName) {
    // ... (implementation for picking up an item)

    // Update player inventory

    // ... (display message for picking up an item)

    // ... (remove item from the room)
  }

  /**
   * Use an item from the player's inventory.
   *
   * @param {string} itemName - The name of the item to be used.
   * @return {void} This function does not return a value.
   */
  useItem(itemName) {
    // ... (implementation for using an item from inventory)
  }

  /**
   * Interact with a non-player character (NPC) by their name.
   *
   * @param {string} npcName - The name of the NPC to interact with.
   * @return {void} This function does not return a value.
   */
  talkToNPC(npcName) {
    // ... (implementation for interacting with NPCs)
  }

  /**
   * Displays the player's inventory.
   *
   * @return {void} This function does not return a value.
   */
  showInventory() {
    // ... (implementation for displaying player inventory)
  }

  /**
   * Ends the game by generating a journey description for the player's path taken and logging it.
   *
   * @return {Promise<void>} A promise that resolves when the game has ended and the player has been logged out.
   */
  async endGame() {
    const roomsVisited = this.player.pathTaken.map(
      (pos) => this.gameMap.rooms[`${pos.x},${pos.y}`]
    );
    const journeyDescription = await this.describer.describeJourney(roomsVisited);
    relayMessage("\nCongratulations! You have reached the end of the game!");
    relayMessage(journeyDescription);

    this.quit();
  }

  /**
   * Logs a message and exits the game.
   *
   * @return {void} This function does not return a value.
   */
  quit() {
    relayMessage("Thanks for playing!");
    if (typeof process !== "undefined" && process.exit) {
      process.exit(0); // Exit the game in Node.js environment
    }
  }
}

module.exports = { default: GameEngine };
