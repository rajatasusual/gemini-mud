/**
 * Entry point of the game.
 *
 * @return {Promise<void>} A promise that resolves when the game is finished.
 */
const run = async () => {
  /**
   * Watches a variable and invokes a callback when the value changes.
   *
   * @param {Object} obj - The object containing the variable.
   * @param {string} propName - The name of the variable.
   * @param {Function} callback - The callback function to be invoked.
   */
  const watchVariable = (obj, propName, callback) => {
    let value = obj[propName];

    Object.defineProperty(obj, propName, {
      get: () => value,
      set: (newValue) => {
        if (newValue !== value) {
          const oldValue = value;
          value = newValue;
          callback(newValue, oldValue);
        }
      },
    });
  };

  /**
   * Appends a message to the messages div.
   *
   * @param {string} message - The message to be appended.
   */
  const appendMessage = (message) => {
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
  };

  /**
   * Parses the input into a command and arguments.
   *
   * @param {string} input - The input string.
   * @return {Object} An object containing the command and arguments.
   */
  const parseInput = (input) => {
    const parts = input.trim().split(" ");
    const cmd = parts[0];
    const args = parts[1];
    return { cmd, args };
  };

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
