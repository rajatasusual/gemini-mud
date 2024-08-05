
import { GoogleGenerativeAI } from "@google/generative-ai";
import Ajv from "ajv";

import diskSchema from "./game-schema.js";

import dotenv from "dotenv";
dotenv.config();

const LOG = process.env.LOG === "true";

class RoomGenerator {
  constructor() {
    const ajv = new Ajv({ strict: false });
    this.schema = diskSchema.properties.rooms.items;
    this.validate = ajv.compile(this.schema);

    this.model = this.getModel();
    this.chat = this.model.startChat({history: []});
  }

  getModel() {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

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
        if(LOG) {
          console.log("[INFO] Room generated", generatedRoom);
        }
        return generatedRoom;
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

export default RoomGenerator;
