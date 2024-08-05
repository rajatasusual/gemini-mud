const GameMap = require("./game/game-map.js").default;
const GameEngine = require("./game/game-engine.js").default;

const MAP_SIZE = window.MAP_SIZE ? window.MAP_SIZE : 5; // Adjust the map size as needed
const LOG = window.LOG ? window.LOG : false;

function watchVariable(obj, propName, callback) {
  let value = obj[propName];

  Object.defineProperty(obj, propName, {
    get() {
      return value;
    },
    set(newValue) {
      if (newValue !== value) {
        const oldValue = value;
        value = newValue;
        callback(newValue, oldValue);
      }
    },
  });
}

function appendMessage(message) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
}

function parseInput(input) {
  const parts = input.trim().split(" ");
  const cmd = parts[0];
  const args = parts[1];
  return { cmd, args };
}

const run = async () => {
  watchVariable(window, "message", (newValue, oldValue) => {
    if (newValue !== oldValue) {
      appendMessage(newValue);
    }
  });

  const gameMap = new GameMap(MAP_SIZE);

  LOG && gameMap.display();

  const engine = await new GameEngine(gameMap);

  appendMessage(await engine.look());

  const input = document.getElementById("input");

  input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      const { cmd, args } = parseInput(input.value);
      await engine.executeCommand(cmd, args);
      input.value = "";

      LOG && gameMap.display();
    }
  });
};

run();