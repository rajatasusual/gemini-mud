/**
 * Describer class represents a game master that generates descriptions of entities using
 * the GoogleGenerativeAI API.
 * @class
 * @author Rajat Kumar
 * @see https://rajatasusual.github.io/gemini-mud/
 */

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

class Describer {
  /**
   * Creates an instance of Describer.
   * @constructor
   */
  constructor() {
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
        maxOutputTokens: 2000
      },
      systemInstruction: `
      You are a game master that describes a given JSON representation of an entity into cohesive natural language, without any disclaimers or forewords.
      `
    });
  }

  /**
   * Asynchronously generates a vivid description for a given room by sending a prompt to a model.
   *
   * @param {Object} room - The room object to generate a description for.
   * @return {Promise<string>} A promise that resolves to the generated description text.
   */
  async describeRoom(room) {
    const prompt = `Generate a vivid description for the following room
    
        \`\`\`json
        ${JSON.stringify(room, null, 2)}
        \`\`\`
  `;

    let response = await this.model.generateContent(prompt);

    return response.response.text();
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

module.exports = { default: Describer };
