// Conditional import for Node.js environment
let GoogleGenerativeAI;
let dotenv;
let Ajv

if (typeof window === "undefined") {
  GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
  dotenv = require("dotenv");
  dotenv.config();
  Ajv = require("ajv").Ajv;

} else {
  // Assuming you have a way to provide the API key in the browser environment
  GoogleGenerativeAI = window.GoogleGenerativeAI;
  Ajv = window.ajv7;
}

/**
 * Class representing a Composer.
 * @class
 */
class Composer {
  /**
   * Creates an instance of Composer.
   * @constructor
   */
  constructor() {
    this.schema = {
      type: "object",
      properties: {
        timeSignature: {
          type: "array",
          items: {
            type: "integer"
          },
        },
        tempo: {
          type: "integer"
        },
        instruments: {
          type: "object",
          properties: {
            rightHand: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  enum: ['sine', 'square', 'sawtooth', 'triangle']
                },
                pack: {
                  type: "string",
                  enum: ['oscillators']
                }
              },
              required: [
                "name",
                "pack"
              ]
            },
            leftHand: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  enum: ['sine', 'square', 'sawtooth', 'triangle']
                },
                pack: {
                  type: "string",
                  enum: ['oscillators']
                }
              },
              required: [
                "name",
                "pack"
              ]
            }
          },
          required: [
            "rightHand"
          ]
        },
        notes: {
          type: "object",
          properties: {
            rightHand: {
              type: "array",
              items: {
                type: "string",
                pattern: "^(whole|dottedHalf|half|dottedQuarter|tripletHalf|quarter|dottedEighth|tripletQuarter|eighth|dottedSixteenth|tripletEighth|sixteenth|tripletSixteenth|thirtySecond)\\|[A-G]#?[0-9]$"
              }
            },
            leftHand: {
              type: "array",
              items: {
                type: "string",
                pattern: "^(whole|dottedHalf|half|dottedQuarter|tripletHalf|quarter|dottedEighth|tripletQuarter|eighth|dottedSixteenth|tripletEighth|sixteenth|tripletSixteenth|thirtySecond)\\|[A-G]#?[0-9]$"
              }
            }
          },
          required: [
            "rightHand"
          ]
        }
      },
      required: [
        "timeSignature",
        "tempo",
        "instruments",
        "notes"
      ]
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
      You are a  master of 8bit chiptune game music. You are given the description of the room  in a retro MUD style game and you build an ambience for the room. You have to reply with the mentioned JSON Schema.
      Take into consideration the tempo and time signature to make the room more interesting. But be in synchronization.
      An example is:
      {
            timeSignature: [4, 4],
            tempo: $scope.tempo,
            instruments: {
                rightHand: {
                    name: 'square',
                    pack: 'oscillators'
                },
                leftHand: {
                    name: 'sawtooth',
                    pack: 'oscillators'
                }
            },
            notes: {
                // Shorthand notation
                rightHand: [
                    'quarter|G4',
                    'quarter|A4',
                    'quarter|B4',
                    'quarter|C5',
                    'quarter|D5',
                    'quarter|E5',
                    'quarter|F#5',
                    'quarter|G5'
                ],
                // More verbose notation
                leftHand: [
                    'quarter|C5',
                    'quarter|D5',
                    'quarter|E5',
                    'quarter|F5',
                    'quarter|G5',
                    'quarter|A5',
                    'quarter|B5',
                    'quarter|C6'
                ]
            }
        }`
    });
  }

  /**
   * Asynchronously generates a vivid music for a given room by sending a prompt to a model.
   *
   * @param {Object} room - The room object to generate a ambience for.
   * @return {Promise<string>} A promise that resolves to the generated music.
   */
  async ComposeMusic(room) {
    const prompt = `Return the 8 bit chiptune composition that define the ambience of the room.
    The only acceptable note rhythm patterns are whole,dottedHalf,half,dottedQuarter,tripletHalf,quarter,dottedEighth,tripletQuarter,eighth,dottedSixteenth,tripletEighth,sixteenth,tripletSixteenth,thirtySecond. Stick to this pattern.
    The room description is: ${room}
  `;

    let response = await this.model.generateContent(prompt);

    try {
      return JSON.parse(response.response.text());
    } catch (error) {
      return response.response.text();
    }
  }
}

module.exports = { default: Composer };