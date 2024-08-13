const GameMap = require('./game/game-map.js').default;
const GameEngine = require('./game/game-engine.js').default;

const question = require('readline-sync').question;

const dotenv = require("dotenv");
dotenv.config();

// Add a check to avoid using Node.js specific 'dotenv' in browser environment
const LOG = process.env.LOG === "true";

const MAP_SIZE = process.env.MAP_SIZE ? parseInt(process.env.MAP_SIZE) : 3;


/**
 * Retrieves user preferences for the adventure game.
 *
 * @return {object} An object containing the user's name, era, and mood preferences.
 */
const getPreferences = () => {
  const userPreferences = {};
  userPreferences["name"] = question("Alright then, Adventurer. What do I call you? ");
  userPreferences["era"] = question("I'm going to call you " + userPreferences["name"] + ". Now, when does this adventure take place? ");
  userPreferences["mood"] = question("That's great. What is the genre of your adventure? ");
  console.log("Perfect. We have all we need to start you on your adventure.");

  return userPreferences;
}

/**
 * Runs the game loop, prompting the user for commands and executing them using the GameEngine.
 *
 * @return {Promise<void>} A promise that resolves when the game loop is complete.
 */
const run = async () => {
  const userPreferences = getPreferences();

  const gameMap = new GameMap(MAP_SIZE);

  LOG && gameMap.display(); // Display the map

  const engine = await new GameEngine(gameMap, userPreferences); // Instantiate the GameEngine. Do not remove await as we have immediately invoked async function in the constructor.

  while (true) {
    const input = question('\n\nWhat do you want to do? (look, move <direction>, take <item>, use <item>, talk <npc>, inventory, quit): ').toLowerCase();
    const [command, ...args] = input.split(' ');
    const arg = args.join(' ');

    console.log('\n\n');

    await engine.executeCommand(command, arg);
  }
};

run();
