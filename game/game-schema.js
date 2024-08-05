/**
 * The schema for the disk storage format.
 *
 * @typedef {Object} DiskSchema
 * @property {string} roomId - The ID of the current room.
 * @property {Array<RoomSchema>} rooms - The array of rooms.
 * @property {Array<ItemSchema>} inventory - The array of items.
 * @property {Array<CharacterSchema>} characters - The array of characters.
 */

/**
 * The schema for a room.
 *
 * @typedef {Object} RoomSchema
 * @property {string} name - The name of the room.
 * @property {string} desc - The description of the room.
 * @property {Array<ExitSchema>} exits - The array of exits.
 * @property {Array<ItemSchema>} items - The array of items.
 * @property {string} onEnter - The event handler for entering the room.
 * @property {string} onExit - The event handler for exiting the room.
 * @property {string} onLook - The event handler for looking at the room.
 */

/**
 * The schema for an exit.
 *
 * @typedef {Object} ExitSchema
 * @property {string} dir - The direction of the exit.
 * @property {string} desc - The description of the exit.
 * @property {string} block - The blocker of the exit.
 */

/**
 * The schema for an item.
 *
 * @typedef {Object} ItemSchema
 * @property {string} name - The name of the item.
 * @property {string} desc - The description of the item.
 * @property {boolean} isTakeable - Whether the item is takeable or not.
 * @property {string} onUse - The event handler for using the item.
 * @property {string} onLook - The event handler for looking at the item.
 * @property {string} onTake - The event handler for taking the item.
 */

/**
 * The schema for a character.
 *
 * @typedef {Object} CharacterSchema
 * @property {string} name - The name of the character.
 * @property {string} roomId - The ID of the room where the character is located.
 * @property {string} desc - The description of the character.
 * @property {Array<TopicSchema>} topics - The array of topics.
 * @property {string} onTalk - The event handler for talking to the character.
 * @property {string} onLook - The event handler for looking at the character.
 */

/**
 * The schema for a topic.
 *
 * @typedef {Object} TopicSchema
 * @property {string} option - The option of the topic.
 * @property {string} line - The line of the topic.
 * @property {string} onSelected - The event handler for selecting the topic.
 */

/**
 * The schema for the disk storage format.
 *
 * @type {DiskSchema}
 */
const diskSchema = {
  type: "object",
  properties: {
    roomId: {
      type: "string"
    },
    rooms: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          desc: {
            type: "string",
          },
          exits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dir: {
                  type: "string",
                  enum: ["north", "south", "east", "west"],
                },
                desc: {
                  type: "string",
                },
                block: {
                  type: "string",
                },
              },
              required: ["dir", "desc"],
            },
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                desc: {
                  type: "string",
                },
                isTakeable: {
                  type: "boolean",
                },
                onUse: {
                  type: "string",
                },
                onLook: {
                  type: "string",
                },
                onTake: {
                  type: "string",
                },
              },
            },
          },
          onEnter: {
            type: "string",
          },
          onExit: {
            type: "string",
          },
          onLook: {
            type: "string",
          },
        },
        required: ["name", "desc", "exits", "onLook"],
      },
    },
    inventory: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
      },
    },
    characters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          roomId: {
            type: "string",
          },
          desc: {
            type: "string",
          },
          topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                option: {
                  type: "string",
                },
                line: {
                  type: "string",
                },
                onSelected: {
                  type: "string",
                },
              },
            },
          },
          onTalk: {
            type: "string",
          },
          onLook: {
            type: "string",
          },
        },
      },
    },
  },
};

module.exports = { default: diskSchema };