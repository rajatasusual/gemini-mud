import Describer from "./describer.js";
import RoomGenerator from "./room-generator.js";

import dotenv from "dotenv";
dotenv.config();

const LOG = process.env.LOG === "true";
const GENERATE = process.env.GENERATE === "true";

class GameEngine {
  constructor(gameMap) {
    this.gameMap = gameMap;
    this.roomGenerator = new RoomGenerator(); // Instantiate the RoomGenerator
    this.describer = new Describer();
    return (async () => {
      await this.init();

      return this;
    })();
  }

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

  async generateRoomAndUpdateMap(x, y) {
    const cellInfo = this.gameMap.getCell(x, y);
    if (this.gameMap.rooms[`${x},${y}`] === undefined) {
      // Generate the room
      const room = await this.roomGenerator.generateRoom(cellInfo);
      const narration = await this.describer.describeRoom(room);

      room["narration"] = narration;

      // Update the gameMap
      this.gameMap.rooms[`${x},${y}`] = room;
      //update cellInfo
      cellInfo.room = room;
    } else {
      if (LOG) {
        console.log("This cell is already occupied.");
      }
      return null; // Or throw an error
    }
  }

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
      console.log(row.join(" "));
    }
  }


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
        console.log("Invalid command.");
        break;
    }
  }

  async look() {
    // Get the current room based on player's position
    const currentRoom = this.gameMap.rooms[`${this.player.x},${this.player.y}`];

    if (!currentRoom) {
      console.log("There's nothing here.");
      return;
    }

    if (!currentRoom["narration"] && GENERATE) {
      const narration = await this.describer.describeRoom(currentRoom);
      currentRoom["narration"] = narration;
    }

    // Display room description (you might need to parse JSON here)
    console.log(currentRoom["narration"]);
  }

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

      if (this.player.x === this.gameMap.end.x && this.player.y === this.gameMap.end.y) {
        await this.endGame();
      } else {
        // Generate the room if it hasn't been generated yet
        if (!this.gameMap.rooms[`${this.player.x},${this.player.y}`] && GENERATE) {
          await this.generateRoomAndUpdateMap(this.player.x, this.player.y);
        }

        this.player.pathTaken.push({ x: this.player.x, y: this.player.y }); // Add new position to pathTaken
        console.log(`You move ${direction}.\n`);
        this.showPathTaken();

        await this.look(); // Automatically look around after moving
      }

    } else {
      console.log("You can't go that way.");
    }
  }

  takeItem(itemName) {
    // ... (implementation for picking up an item)

    // Update player inventory

    // ... (display message for picking up an item)

    // ... (remove item from the room)
  }

  useItem(itemName) {
    // ... (implementation for using an item from inventory)
  }

  talkToNPC(npcName) {
    // ... (implementation for interacting with NPCs)
  }

  showInventory() {
    // ... (implementation for displaying player inventory)
  }

  async endGame() {
    const roomsVisited = this.player.pathTaken.map(
      (pos) => this.gameMap.rooms[`${pos.x},${pos.y}`]
    );
    const journeyDescription = await this.describer.describeJourney(roomsVisited);
    console.log("\nCongratulations! You have reached the end of the game!");
    console.log(journeyDescription);

    this.quit();
  }

  quit() {
    console.log("Thanks for playing!");
    process.exit(0); // Exit the game
  }
}

export default GameEngine;

