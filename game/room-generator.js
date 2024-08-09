let GoogleGenerativeAI;
let dotenv;
let Ajv;

const diskSchema = require("./game-schema").default;

// Add a check to avoid using Node.js specific 'dotenv' in browser environment
if (typeof window === "undefined") {
  GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
  dotenv = require("dotenv");
  Ajv = require("ajv").Ajv;
  dotenv.config();
} else {
  // Assuming you have a way to provide the API key in the browser environment
  GoogleGenerativeAI = window.GoogleGenerativeAI;
  Ajv = window.ajv7;
}

/**
 * RoomGenerator class generates rooms for a MUD-style game using Generative AI.
 *
 * @class
 * @author Rajat Kumar
 * @see https://rajatasusual.github.io/gemini-mud/
 */
class RoomGenerator {
  /**
   * Constructs a new instance of the RoomGenerator class.
   *
   * Initializes the AJV validator with loose mode, sets up the schema for room items,
   * and compiles the validator. Then, initializes the model and chat history for
   * the Generative AI model.
   *
   * @return {void}
   */
  constructor() {
    const ajv = new Ajv({ strict: false });
    this.schema = diskSchema.properties.rooms.items;
    this.validate = ajv.compile(this.schema);

    this.model = this.getModel();
    this.chat = this.model.startChat({history: []});
  }

  /**
   * Returns a generative model for generating a room description in a MUD-style game.
   *
   * @return {Promise<GenerativeModel>} A promise that resolves to a generative model.
   */
  getModel() {

    const apiKey = typeof process !== "undefined" && process.env ? process.env.API_KEY : window.API_KEY;

    const genAI = new GoogleGenerativeAI(apiKey);

    return genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: this.schema,
        maxOutputTokens: 2000
      },
      systemInstruction: `You are a game master that generates a room description in provided JSON schema for a MUD-style game progressively.

      You will receive a cell information object as input and total number of exits as arguments.

      Additional details:
      - If it's a start room, it should feel welcoming and inviting. Setup a fantasy theme.
      - If it's an end room, there should be a sense of accomplishment and maybe a reward.
      - If it's a win path room, it should provide clues or hints to the player.
      - If it's a dead end, it might feel more cramped or desolate, with potential traps or red herrings.
      - Consider adding some atmospheric descriptions based on the room type (e.g., echoing sounds in a large cavernous room, a musty smell in a damp cellar).
      - Include items in the room if needed, some of which could be relevant to the game's progress.
      - Include the exits as mentioned along with their directions and descriptions.
      - Do not include any unnecessary details or clutter.
      - Do not include any additional descriptions or instructions.`
    });
  }

  /**
   * Asynchronously generates a room description for a MUD-style game based on the provided cell information.
   *
   * @param {Object} cellInfo - An object containing information about the cell, including its type and exits.
   * @param {string} cellInfo.type - The type of the cell.
   * @param {Object.<string, boolean>} cellInfo.exits - An object representing the exits from the cell, where the keys are the directions and the values are boolean indicating whether there is an exit in that direction.
   * @return {Promise<?Object>} A promise that resolves to the generated room description as a JSON object if it passes validation, or null if it fails validation or if there is an error.
   */
  async generateRoom(cellInfo) {
    const prompt = `Generate a room description for a ${cellInfo.type} room in a MUD-style game. 
  
    Exits: ${Object.entries(cellInfo.exits)
        .filter(([, hasExit]) => hasExit)
        .map(([dir]) => dir)
        .join(", ")}
  `;

    let response = await this.chat.sendMessage(prompt);
    try {
      const generatedRoom = JSON.parse(response.response.text());
      if (!this.validate(generatedRoom)) {
        console.error("[ERROR]: Cannot validate generated room");
        return null;

      } else {
        return generatedRoom;
      }
    } catch (err) {
      // SHOW ERROR
      return null;
    }
  }
}

module.exports = { default: RoomGenerator };