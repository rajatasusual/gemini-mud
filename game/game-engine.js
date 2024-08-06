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

    // Initialize the nodes and links
    this.nodes = [];
    this.links = [];
    this.nodeMap = new Map();
    this.nodeIdMap = new Map(); // Maps coordinate to node object for quick reference

    // Initialize the player and generate the first room if GENERATE is true
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


  /**
   * Generates unique IDs for the given room and its exits.
   *
   * @param {Object} room - The room object to update IDs for.
   * @return {void} This function does not return a value.
   */
  updateIDs(room) {
    room._id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    for (let i = 0; i < room.exits.length; i++) {
      room.exits[i]._id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
  }


  /**
   * Adds a node to the node map if it does not already exist, and updates the node ID map and nodes array.
   *
   * @param {Object} room - The room object to add as a node.
   * @return {Object|null} The added node object, or null if the node already exists.
   */
  addNode(id) {
    const room = this.gameMap.rooms[id];
    if (!this.nodeMap.has(id)) {
      const node = { id, label: room.name };
      this.nodeMap.set(id, node);
      this.nodeIdMap.set(id, node);
      this.nodes.push(node);
      return node;
    }

    return null;
  };

  /**
   * Adds a link between two nodes in the graph.
   *
   * @param {Object} sourceRoom - The source room object.
   * @param {Object} targetRoom - The target room object.
   * @return {Object|null} The added link object, or null if the source or target nodes do not exist.
   */
  addLink(sourceRoomLocation, targetRoomLocation) {
    
    const sourceNode = this.nodeIdMap.get(sourceRoomLocation);
    const targetNode = this.nodeIdMap.get(targetRoomLocation);
    if (sourceNode && targetNode) {
      const link = { source: sourceNode.id, target: targetNode.id };
      this.links.push(link);
      return link;
    }

    return null;
  };


  /**
   * Generates D3 data based on the player's path taken.
   *
   * @param {boolean} [isNew=true] - Indicates whether the data is for a new game or not.
   * @return {Object} - An object containing the generated D3 data. If `isNew` is false, the object contains the last node, link, and current node. Otherwise, it contains all nodes and links.
   */
  generateD3Data(isNew = true) {
    let node = null;
    let link = null;
    // Add nodes and links for the path taken
    for (let i = 0; i < this.player.pathTaken.length; i++) {
      const cell = this.player.pathTaken[i];
      node = this.addNode(`${cell.x},${cell.y}`);

      if (i > 0) {
        const prevCell = this.player.pathTaken[i - 1];
        link = this.addLink(`${prevCell.x},${prevCell.y}`, `${cell.x},${cell.y}`);
      }
    }

    if (!isNew) {
      const currentNode = this.nodeMap.get(`${this.player.x},${this.player.y}`);

      return { nodes: [node == null ? currentNode : node], links: [link], currentNode };
    }

    return { nodes: this.nodes, links: this.links };
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
   * Asynchronously executes a command based on the given command and argument.
   *
   * @param {string} command - The command to execute.
   * @param {string} arg - The argument for the command.
   * @return {Promise<boolean>} A promise that resolves to a boolean indicating if the player moved or not.
   */
  async executeCommand(command, arg) {
    let moved = false;
    switch (command) {
      case "look":
        await this.look();
        break;
      case "move":
      case "go":
        moved = await this.move(arg);
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

    return moved;
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
     * @return {Promise<boolean>} A promise that resolves to true if the player moved successfully, or false if the direction is invalid.
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

      return true;
    } else {
      relayMessage("You can't go that way.");

      return false;
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
