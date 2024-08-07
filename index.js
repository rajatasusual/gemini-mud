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

function typeMessage(element, message, speed) {
  let i = 0;
  function type() {
    if (i < message.length) {
      element.innerHTML += message.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

function appendMessage(message) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");
  messagesDiv.appendChild(messageElement);
  messageElement.className = 'message';
  messages.appendChild(messageElement);
  typeMessage(messageElement, message, 25);
}

function parseInput(input) {
  const parts = input.trim().split(" ");
  const cmd = parts[0];
  const args = parts[1];
  return { cmd, args };
}

const run = async () => {
  watchVariable(window, "message", (newValue, oldValue) => {
    if (typeof newValue === "object") {
      function applyGradient(gradientColors) {
        const gradientString = `linear-gradient(-45deg, ${gradientColors.join(', ')})`;
        document.body.style.background = gradientString;
        document.body.style.backgroundSize = '400% 400%'; // Ensure animation works
      }

      applyGradient(newValue);
    } else if (newValue !== oldValue) {
      appendMessage(newValue);
    }
  });

  const gameMap = new GameMap(MAP_SIZE);

  LOG && gameMap.display();

  const engine = await new GameEngine(gameMap);

  const input = document.getElementById("input");

  input.addEventListener("keydown", async (event) => {

    if (event.key === "Enter") {
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messages.appendChild(messageElement);
      typeMessage(messageElement, input.value, 50);

      // Execute the command
      const { cmd, args } = parseInput(input.value);
      const moved = await engine.executeCommand(cmd, args);

      if (moved) {
        // Generate D3 data and render the graph
        const { nodes, links, currentNode } = engine.generateD3Data(false);
        GRAPH.updateVisualization(nodes, links, currentNode, false);
      }

      input.value = "";
      input.focus();

      LOG && gameMap.display();
    }
  });

  // Generate D3 data and render the graph
  const { nodes, links } = engine.generateD3Data(true);

  GRAPH.init(nodes, links);
};

run();