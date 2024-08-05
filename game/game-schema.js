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
          _id: {
            type: "string",
          },
          exits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dir: {
                  type: "string",
                  enum: [
                    "north",
                    "south",
                    "east",
                    "west"
                  ]
                },
                _id: {
                  type: "string"
                },
                desc: {
                  type: "string"
                },
                block: {
                  type: "string"
                }
              },
              required: ["dir", "_id", "desc"]
            }

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
                  type: "string"
                },
                isTakeable: {
                  type: "boolean"
                },
                onUse: {
                  type: "string"
                },
                onLook: {
                  type: "string"
                },
                onTake: {
                  type: "string"
                }
              }
            }
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
        required: ["name", "desc", "exits", "_id", "onLook"]
      }
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
      }
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
                  type: "string"
                },
                line: {
                  type: "string"
                },
                onSelected: {
                  type: "string"
                }
              }
            },
          },
          onTalk: {
            type: "string"
          },
          onLook: {
            type: "string"
          },
        },
      }
    }
  }
};

export default diskSchema;