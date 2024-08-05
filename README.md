# Gemini MUD

A MUD-style text adventure game powered by Google Gemini AI. Explore a dynamic world, solve puzzles, interact with unique characters, and uncover hidden secrets.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Game](#running-the-game)
- [How to Play](#how-to-play)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Gemini MUD combines the nostalgia of classic text-based adventure games with the power of modern AI to generate dynamic and engaging content. Every room description, character interaction, and plot twist is crafted by the Gemini AI model, creating a truly unique experience each time you play.

## Features

- **Dynamic Map and Room Generation:** Entire maps and rooms are created on the fly as you explore, each with its own unique description, items, and potential dangers.
- **Procedural Map:** The game world is procedurally generated, ensuring a new layout and challenges with every playthrough.
- **Interactive Storytelling:** Engage with the world through text commands, uncovering a captivating storyline.
- **Character Interactions:** Meet a variety of characters, each with their own personality and motivations.
- **Item Collection and Usage:** Find and collect items that can help you solve puzzles or overcome obstacles.
- **Google Gemini AI Integration:** Leveraging Google's powerful AI model for rich, creative content generation.

## Getting Started

### Prerequisites

- **Node.js and npm:** Make sure you have Node.js and npm installed on your system. You can download them from [https://nodejs.org/](https://nodejs.org/).
- **Google Cloud Project: (Optional)** You'll need a Google Cloud Project with the Gemini API enabled. Follow the instructions on [https://developers.generativeai.google/](https://developers.generativeai.google/) to set this up.
- **API Key:** Obtain an API key for the Gemini API from your Google Cloud Project. Store it in a `.env` file at the root of this project:

```
API_KEY=your_api_key
```

### Installation

1. Clone this repository:

```bash
git clone [https://github.com/](https://github.com/)rajattasusual/gemini-mud.git
```

2. Install dependencies:

```bash
cd gemini-mud
npm install
```

### Running the Game

```bash
npm start
```

## How to Play

1. **Explore:** Move around the world by typing directions like `north`, `south`, `east`, or `west`.
2. **Look Around:** Use the `look` command to get a detailed description of the current room.
3. **Interact:** Type `take <item>`, `use <item>`, or `talk <npc>` to interact with objects and characters.
4. **Inventory:** Type `inventory` to see what items you're carrying.
5. **Quit:** Type `quit` to exit the game.

## Contributing

Contributions are welcome! Please feel free to submit bug reports, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.