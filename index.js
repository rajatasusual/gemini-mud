const GameMap = require("./game/game-map.js").default;
const GameEngine = require("./game/game-engine.js").default;

const MAP_SIZE = window.MAP_SIZE ? window.MAP_SIZE : 5; // Adjust the map size as needed
const LOG = window.LOG ? window.LOG : false;
window.MUSIC = typeof process !== "undefined" ? false : true;

let ENGINE = null;

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

document.getElementById("muteSwitch").addEventListener("change", (event) => {
  if (event.target.checked) {
    window.MUSIC = true;

    ENGINE.player && ENGINE.musicPlayer.play();

  } else {
    window.MUSIC = false;

    ENGINE.player && ENGINE.musicPlayer.pause();
  }
})

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

function appendMessage(message, type) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");
  messagesDiv.appendChild(messageElement);
  messageElement.className = 'message';
  
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
    if (newValue !== oldValue) {
      const message = newValue.message;
      const type = newValue.type;
      appendMessage(message, type);
      const messagesDiv = document.getElementById("messages");
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  });

  const gameMap = new GameMap(MAP_SIZE);

  LOG && gameMap.display();

  ENGINE = await new GameEngine(gameMap);

  const input = document.getElementById("input");

  input.addEventListener("keydown", async (event) => {

    if (event.key === "Enter") {
      const value = input.value.trim();
      input.value = "";
      input.focus();

      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messages.appendChild(messageElement);

      // Execute the command
      const { cmd, args } = parseInput(value);
      const result = await ENGINE.executeCommand(cmd, args);

      if (result && (cmd === "move" || cmd === "go")) {
        // Generate D3 data and render the graph
        const { nodes, links, currentNode } = ENGINE.generateD3Data(false);
        GRAPH.updateVisualization(nodes, links, currentNode, false);
      } else if (!result) {
        //SHOW ERROR MESSAGE
      }

      LOG && gameMap.display();
    }
  });

  // Generate D3 data and render the graph
  const { nodes, links } = ENGINE.generateD3Data(true);

  GRAPH.init(nodes, links);
};

run();