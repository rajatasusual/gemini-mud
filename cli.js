/**
 * @typedef {import("./game/game-map.js").default} GameMap
 * @typedef {import("./game/game-engine.js").default} GameEngine
 * @typedef {import("./game/logger.js").default} Logger
 */

// Load environment variables if running in Node.js
let dotenv;
if (typeof window === "undefined") {
  dotenv = require("dotenv");
  dotenv.config();
}

/**
 * Returns user input from the command line or browser prompt.
 * @return {string} The user's input in lowercase.
 */
const getInput = () => {
  if (typeof window === "undefined") {
    const question = require('readline-sync').question;
    return question('\n\nWhat do you want to do? (look, move <direction>, take <item>, use <item>, talk <npc>, inventory, quit): ').toLowerCase();
  } else {
    return prompt('What do you want to do? (look, move <direction>, take <item>, use <item>, talk <npc>, inventory, quit): ').toLowerCase();
  }
};

/** @type {boolean} */
const LOG = typeof process !== "undefined" && process.env ? process.env.LOG === "true" : false;

/** @type {number} */
const MAP_SIZE = typeof process !== "undefined" && process.env ? parseInt(process.env.MAP_SIZE) : 3;

/**
 * Runs the game loop, prompting the user for commands and executing them using the GameEngine.
 *
 * @return {Promise<void>} A promise that resolves when the game loop is complete.
 */
const run = async () => {
  const gameMap = new GameMap(MAP_SIZE);

  LOG && gameMap.display(); // Display the map

  const engine = await new GameEngine(gameMap); // Instantiate the GameEngine. Do not remove await as we have immediately invoked async function in the constructor.

  while (true) {
    const input = getInput();
    const [command, ...args] = input.split(' ');
    const arg = args.join(' ');

    relayMessage('\n\n');

    await engine.executeCommand(command, arg);
  }
};

run();
