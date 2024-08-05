const GameMap = require("./game/game-map.js").default;
const GameEngine = require("./game/game-engine.js").default;

const MAP_SIZE = window.MAP_SIZE ? window.MAP_SIZE : 5; // Adjust the map size as needed

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

function updateOutput(message) {
    //update the output div
    document.getElementById("output").innerHTML = message;
}

function parseInput(input) {
    const parts = input.trim().split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);
    return { cmd, args };
}

const run = async () => {

    watchVariable(window, "message", (newValue, oldValue) => {
        if (newValue !== oldValue) {
            updateOutput(newValue);
        }
    });

    const gameMap = new GameMap(MAP_SIZE);

    const
        engine = await new GameEngine(gameMap);

    const message = await engine.look();

    const input = document.getElementById("input");

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const { cmd, args } = parseInput(input.value);
            engine.executeCommand(cmd, args);
            input.value = "";
        }
    });
};

run();