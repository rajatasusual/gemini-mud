// Conditional import for Node.js environment
let GoogleGenerativeAI;
let dotenv;

if (typeof window === "undefined") {
  GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
  dotenv = require("dotenv");
  dotenv.config();
} else {
  // Assuming you have a way to provide the API key in the browser environment
  GoogleGenerativeAI = window.GoogleGenerativeAI;
}

/**
 * Class representing a Designer.
 * @class
 */
class Designer {
  /**
   * Creates an instance of Designer.
   * @constructor
   */
  constructor() {
    this.schema = {
      type: "array",
      items: {
        type: "string"
      }
    };
    const ajv = new Ajv({ strict: false });
    this.validate = ajv.compile(this.schema);

    this.model = this.getModel();
  }

  /**
   * Retrieves a generative model from the GoogleGenerativeAI API.
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
      systemInstruction: `
      You are a game master. Your job is to set the ambience of the room. You will be given the description of the room and you need to reply with the mentioned JSON Schema.
      `
    });
  }

  /**
   * Asynchronously generates a vivid ambience for a given room by sending a prompt to a model.
   *
   * @param {Object} room - The room object to generate a ambience for.
   * @return {Promise<string>} A promise that resolves to the generated ambience.
   */
  async DesignRoom(room) {
    const prompt = `Return the array of three gradient colors that define the ambience of the room.
    The room description is: ${room}
  `;

    let response = await this.model.generateContent(prompt);

    try {
      return JSON.parse(response.response.text());
    } catch (error) {
      return response.response.text();
    }
  }

  /**
   * Asynchronously generates a short, narrative summary of a player's journey through the given rooms in a MUD-style game.
   *
   * @param {Array<Object>} rooms - A JSON representation of the rooms in the journey.
   * @return {Promise<string>} A promise that resolves to the generated narrative summary text.
   */
  async describeJourney(rooms) {
    const prompt = `
      Create a short, narrative summary of a player's journey through the following rooms in a MUD-style game, leading up to a satisfying conclusion. Highlight key moments, challenges overcome, and discoveries made.

      \`\`\`json
      ${JSON.stringify(rooms, null, 2)}
      \`\`\`
      `;

    let response = await this.model.generateContent(prompt);

    return response.response.text();
  }
}

module.exports = { default: Designer };