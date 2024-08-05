const GameMap = require('./game/game-map.js').default;
const GameEngine = require('./game/game-engine.js').default;
const relayMessage = require('./game/logger.js').default;

let dotenv;
if (typeof window === "undefined") {
  dotenv = require("dotenv");
  dotenv.config();
}

// Replace readline-sync's question() with browser prompt() and Node.js readline-sync
const getInput = () => {
  if (typeof window === "undefined") {
    const question = require('readline-sync').question;
    return question('\n\nWhat do you want to do? (look, move <direction>, take <item>, use <item>, talk <npc>, inventory, quit): ').toLowerCase();
  } else {
    return prompt('What do you want to do? (look, move <direction>, take <item>, use <item>, talk <npc>, inventory, quit): ').toLowerCase();
  }
};

// Add a check to avoid using Node.js specific 'dotenv' in browser environment
const LOG = typeof process !== "undefined" && process.env ? process.env.LOG === "true" : false;

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
