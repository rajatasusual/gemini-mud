
import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from "dotenv";
dotenv.config();


class Describer {
  constructor() {
    this.model = this.getModel();
  }

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

  async describeRoom(room) {
    const prompt = `Generate a vivid description for the following room
    
        \`\`\`json
        ${JSON.stringify(room, null, 2)}
        \`\`\`
  `;

    let response = await this.model.generateContent(prompt);

    return response.response.text();
  }

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
