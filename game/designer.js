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

  hexToRgb(hex) {
    // Remove the leading #
    hex = hex.replace(/^#/, '');

    // Convert shorthand hex (#abc) to full hex (#aabbcc)
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    // Convert to RGB
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return { r, g, b };
  }

  luminance(r, g, b) {
    // Convert RGB to sRGB
    let a = [r, g, b].map(value => {
      value /= 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    // Calculate luminance
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  bestContrastColor(gradient) {
    let totalLuminance = 0;

    // Calculate the average luminance
    gradient.forEach(color => {
      let { r, g, b } = this.hexToRgb(color);
      totalLuminance += this.luminance(r, g, b);
    });

    let averageLuminance = totalLuminance / gradient.length;

    // Return black for bright gradients, and white for dark gradients
    return averageLuminance > 0.5 ? '#000000' : '#FFFFFF';
  }

}

module.exports = { default: Designer };