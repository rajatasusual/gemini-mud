import { question } from 'readline-sync';

import GameMap from "./game-map.js";
import GameEngine from './game-engine.js';

import dotenv from "dotenv";
dotenv.config();

const LOG = process.env.LOG === "true";
const MAP_SIZE = (process.env.MAP_SIZE && parseInt(process.env.MAP_SIZE)) || 10;

const run = async () => {

  const gameMap = new GameMap(MAP_SIZE);

  LOG && gameMap.display(); // Display the map

  const engine = await new GameEngine(gameMap); // Instantiate the GameEngine. Do not remove await as we have immediatey invoke async function in the constructor.

  while (true) {
    const input = question('\n\nWhat do you want to do? (look, move <direction>, take <item>, use <item>, talk <npc>, inventory, quit): ').toLowerCase();
    const [command, ...args] = input.split(' ');
    const arg = args.join(' ');

    console.log('\n\n');

    await engine.executeCommand(command, arg);
  }


};

run();
