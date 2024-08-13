// Importing necessary modules
const GameMap = require("./game/game-map.js").default;
const GameEngine = require("./game/game-engine.js").default;

let attribute = null;
let userPreferences = {};

const fsm = new StateMachine({
  init: 'start',
  transitions: [
    { name: 'checkAccess', from: 'start', to: 'init' },
    { name: 'getPreferences', from: 'init', to: 'build' },
    { name: 'introduce', from: 'build', to: 'intro' },
    { name: 'play', from: 'intro', to: 'game' },
    { name: 'restart', from: 'game', to: 'start' }
  ],
  methods: {
    /**
     * Initializes the application by setting up event listeners, creating a GameMap,
     * creating a GameEngine, and generating D3 data for rendering a graph.
     *
     * @return {Promise<void>} A Promise that resolves when the initialization is complete.
     */
    onCheckAccess: function () {
      checkAccess();
    },
    onGetPreferences: function () {
      buildGame();
    },
    onIntroduce: function () {
      introduce();
    },
    onPlay: function () {
      runGame();
    },
    onRestart: function () {
      built = false;
    }
  }
});

// Configuration and global variables
const MAP_SIZE = window.MAP_SIZE || 5;
const LOG = window.LOG || false;
window.MUSIC = typeof process === "undefined" || !process.env.BROWSER ? false : (localStorage.getItem('music') || true);

if (window.MUSIC) {
  document.getElementById("muteSwitch").checked = true;
} else {
  document.getElementById("muteSwitch").checked = false;
}

let built = false;
let introduced = false;

let ENGINE = null;

// Utility Functions

function showApiKeyPopup() {
  document.getElementById('apiKeyPopup').style.display = 'block';
}


/**
 * Saves the provided API key in LocalStorage and sets it in the window object for immediate use.
 * If the API key is successfully saved, it hides the API key popup and triggers the fsm.getPreferences() function.
 * If no API key is provided, it displays an alert prompting the user to enter an API key.
 *
 * @return {void}
 */
function saveApiKey() {
  const apiKey = document.getElementById('apiKeyInput').value;
  if (apiKey) {
    localStorage.setItem('apiKey', apiKey); // Store in LocalStorage
    window.API_KEY = apiKey; // Also set it in the window object for immediate use
    document.getElementById('apiKeyPopup').style.display = 'none';

    fsm.getPreferences();
  } else {
    alert('Please enter an API key.');
  }
}

/**
 * Checks if an API key exists in LocalStorage and uses it if available.
 * If no API key is found, it displays a popup to enter the API key.
 *
 * @return {Promise<void>}
 */
async function checkAccess() {

  document.getElementById('saveApiKey').addEventListener('click', saveApiKey);

  // Check if API key exists in LocalStorage, and use it if available
  const storedApiKey = localStorage.getItem('apiKey');
  if (storedApiKey) {
    window.API_KEY = storedApiKey;

    setTimeout(() => {
      fsm.getPreferences();
    }, 10);
  } else {
    showApiKeyPopup();
  }
}

/**
 * Watches a variable and triggers a callback whenever the value changes.
 *
 * @param {Object} obj - The object containing the variable to watch.
 * @param {string} propName - The name of the variable to watch.
 * @param {Function} callback - The callback function to trigger when the value changes.
 */
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

/**
 * Types out a message character by character in the specified element with the given speed.
 *
 * @param {HTMLElement} element - The element where the message will be typed.
 * @param {string} message - The message to be typed.
 * @param {number} speed - The speed at which each character will be typed (in milliseconds).
 */
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

/**
 * Appends a message to the "messages" div element and types out the message character by character.
 *
 * @param {string} message - The message to be appended and typed.
 * @param {string} type - The type of message (e.g., "user" or "system").
 */
function appendMessage(message, type) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");

  // Apply a different class based on the type
  if (type === "user") {
    messageElement.className = "message user-message";
  } else {
    messageElement.className = `message ${type === "system" ? "system-message" : "general-message"}`;
    // Add event listener to remove the message on click
    messageElement.addEventListener('click', () => {
      messageElement.remove();
    });
  }

  // Append the message to the messages div
  messagesDiv.appendChild(messageElement);

  // Type out the message
  typeMessage(messageElement, message, 5);
}

/**
 * Parses the input string into a command and arguments.
 *
 * @param {string} input - The input string to be parsed.
 * @return {Object} An object containing the command and arguments.
 */
function parseInput(input) {
  const [cmd, args = ""] = input.trim().split(" ");
  return { cmd, args };
}

// DOM Event Listeners

document.getElementById("messages").addEventListener("scroll", showHideScrollIndicator);

document.getElementById("scrollIndicator").addEventListener("click", scrollToBottom);

document.getElementById("muteSwitch").addEventListener("change", (event) => {
  if (event.target.checked) {
    window.MUSIC = true;
    ENGINE.player && ENGINE.musicPlayer.play();
    localStorage.setItem('music', true);
  } else {
    window.MUSIC = false;
    ENGINE.player && ENGINE.musicPlayer.pause();
    localStorage.setItem('music', false);
  }
});

document.getElementById("input").addEventListener("keydown", handleInput);

// Loading Screen Functions

/**
 * Displays the loading screen by removing the hidden class and adding a show class after a short delay.
 *
 * @return {void}
 */
function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.remove("hidden"); // Ensure it's not hidden
  setTimeout(() => {
    loadingScreen.classList.add("show"); // Start the fade-in
  }, 10); // Small delay to ensure the transition applies
}

/**
 * Hides the loading screen element by removing the 'show' class and adding the 'hidden' class after a short delay.
 *
 * @return {void}
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.remove("show"); // Start the fade-out

  setTimeout(() => {
    if (!loadingScreen.classList.contains("show")) {
      loadingScreen.classList.add("hidden"); // Fully hide after fade-out
    }
  }, 500); // Match this with the transition duration (0.5s)
}

// Scroll Indicator Functions

/**
 * Toggles the visibility of the scroll indicator based on the scroll position of the messages div.
 *
 * @return {void}
 */
function showHideScrollIndicator() {
  const messagesDiv = document.getElementById("messages");
  const scrollIndicator = document.getElementById("scrollIndicator");

  // Check if the user is not scrolled to the bottom
  const isScrolledToBottom = messagesDiv.scrollTop + messagesDiv.clientHeight >= messagesDiv.scrollHeight - 1;

  if (!isScrolledToBottom) {
    scrollIndicator.classList.remove("hidden");
  } else {
    scrollIndicator.classList.add("hidden");
  }
}

/**
 * Scrolls the messages container to the bottom.
 *
 * @return {void}
 */
function scrollToBottom() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Game Initialization and Control

/**
 * Builds a game by guiding the user through a series of questions to gather preferences.
 *
 * @param {string} value - The user's response to the current question.
 * @return {undefined}
 */
async function buildGame(value) {
  if (!attribute) {
    appendMessage("Alright then, Adventurer. What do I call you?", "general");
    attribute = "name";
  } else {
    switch (attribute) {
      case "name":
        appendMessage("I'm going to call you " + value + ". Now, when does this adventure take place?", "general");
        userPreferences["name"] = value;
        attribute = "era";
        break;
      case "era":
        appendMessage("That's great. What is the genre of your adventure?", "general");
        userPreferences["era"] = value;
        attribute = "mood";
        break;
      case "mood":
        appendMessage("Perfect. We have all we need to start you on your adventure.", "general");
        userPreferences["mood"] = value;
        fsm.introduce();
        break;
    }
  }

}

/**
 * Introduces the game to the player by providing instructions on how to navigate and start the game.
 *
 * @return {void}
 */
function introduce() {
  appendMessage("The steps are simple, mate. It will evolve but for now it is just a crawler. You want to go north, you  type 'go north'. You want to go south, you type 'go south'. You get the idea. Now, type 'start' to begin.", "general");
  introduced = true;
}

/**
 * Initializes and starts the game by setting up the game map, engine, and rendering the graph.
 * 
 * @async
 * @return {Promise<void>}
 */
async function runGame() {
  watchVariable(window, "message", (newValue, oldValue) => {
    if (newValue !== oldValue) {
      const { message, type } = newValue;
      appendMessage(message, type);
      scrollToBottom();
    }
  });

  showLoadingScreen();

  const gameMap = new GameMap(MAP_SIZE);
  LOG && gameMap.display();

  ENGINE = await new GameEngine(gameMap, userPreferences);

  // Generate D3 data and render the graph
  const { nodes, links } = ENGINE.generateD3Data(true);

  GRAPH.init(nodes, links);

  hideLoadingScreen();
}

/**
 * Handles the input event when the Enter key is pressed. Parses the input value, executes the command,
 * updates the graph if necessary, and displays the game map if logging is enabled.
 *
 * @param {Event} event - The input event object.
 * @return {Promise<void>} A promise that resolves when the function completes.
 */
async function handleInput(event) {
  if (event.key === "Enter") {
    const value = event.target.value.trim();
    event.target.value = "";
    event.target.focus();


    switch (fsm.state) {
      case "build":
        appendMessage(value, "user");
        buildGame(value);
        break;
      case "intro":
        if (value.toLowerCase() === "start") {
          document.getElementById("messages").innerHTML = "";
          fsm.play();
        }
        break;
      case "game":
        interpretCommand(value);
        break;

      default:
        break;
    }
  }
}

/**
 * Interprets and executes a user command, updating the game state and graph as necessary.
 *
 * @param {string} value - The user input command to be interpreted.
 * @return {Promise<void>} A promise that resolves when the command has been executed.
 */
async function interpretCommand(value) {
  const { cmd, args } = parseInput(value);

  showLoadingScreen();

  const result = await ENGINE.executeCommand(cmd, args);

  setTimeout(() => {
    hideLoadingScreen();
  }, 50);

  if (result && (cmd === "move" || cmd === "go")) {
    updateGraph();
  } else if (!result) {
    // SHOW ERROR MESSAGE
  }

  LOG && ENGINE.gameMap.display();
}


/**
 * Asynchronously updates the graph by generating D3 data and updating the visualization.
 *
 * @return {Promise<void>} A promise that resolves when the graph is updated.
 */
async function updateGraph() {
  const { nodes, links, currentNode } = ENGINE.generateD3Data(false);
  GRAPH.updateVisualization(nodes, links, currentNode, false);
}


// Check Access and Start this baby!
fsm.checkAccess();