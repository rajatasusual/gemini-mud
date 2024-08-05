
import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from "dotenv";
dotenv.config();


/**
 * Class representing a Describer.
 * @class
 */
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
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

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

export default Describer;
