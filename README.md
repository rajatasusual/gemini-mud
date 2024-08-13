## Gemini MUD

[![Gemini MUD](llama.png)](https://rajatasusual.github.io/gemini-mud/)

**A Text-Based Adventure Game with AI-Generated Worlds**

Gemini MUD is a text-based Multi-User Dungeon (MUD) game that leverages AI to procedurally generate unique stages, complete with immersive music and ambience. 

**DEMO: [https://rajatasusual.github.io/gemini-mud/](https://rajatasusual.github.io/gemini-mud/)**

### Table of Contents

* [Introduction](#introduction)
* [Features](#features)
* [How to Play](#how-to-play)
* [Technical Details](#technical-details)
* [Getting Started](#getting-started)
* [Demo](#demo)
* [Disclaimer](#disclaimer) 


### Introduction

Gemini MUD combines the nostalgia of classic text-based adventure games with the power of modern AI to generate dynamic and engaging content. Every room description, character interaction, and plot twist is crafted by the Gemini AI model, creating a truly unique experience each time you play.

### Features

* **AI-Powered World Generation:** Experience a dynamic world where each stage is procedurally generated using AI, offering endless possibilities for exploration.
* **Atmospheric Music and Ambience:** Immerse yourself in the game's atmosphere with AI-generated music and ambience that complements each stage's unique characteristics.
* **Text-Based Interface:** Engage in a classic text-based adventure, relying on your imagination and the power of words to navigate the world.
* **Simple Commands:** Interact with the game using intuitive commands like 'go north', 'look', 'take', and more.

### How to Play

1. **Enter your OpenAI API Key:** Provide your API key to enable the AI features.
2. **Answer the Questions:** Respond to a series of questions to customize your adventure:
   * Your name
   * The era in which the adventure takes place
   * The genre or mood of the adventure
3. **Start Exploring:**  Begin your journey by typing 'start'.
4. **Navigate the World:** Use commands like 'go north', 'go south', 'go east', and 'go west' to move between rooms.
5. **Interact with the Environment:**  Type 'look' to observe your surroundings and discover hidden details.
6. **Uncover the Story:** Progress through the game, encountering challenges and making choices that shape your narrative.

### Technical Details

* **Core Files:**
    * `index.js`: Main game logic and user interaction handling
    * `game-map.js`: Manages the procedural generation of the game map
    * `game-schema.js`: Defines the data structure for storing game information
    * `game-engine.js`: Handles game state, player actions, and AI interactions
    * `room-generator.js`: Generates room descriptions using AI
    * `composer.js`: Creates music and ambience using AI
    * `describer.js`:  Generates narrative descriptions using AI
    * `index.html`:  Provides the user interface for the game
* **AI Integration:** The game utilizes the Google Generative AI API to:
    * Generate unique room descriptions
    * Compose fitting music and ambience
    * Create narrative summaries of the player's journey

### Getting Started

1. **Clone the Repository:** 
   ```bash
   git clone https://github.com/rajatasusual/gemini-mud.git
   ```
2. **Obtain an API Key:** Get an API key from OpenAI.
3. **Play the Game:**
    * **In Browser:**
        1. Open the `index.html` file in your web browser.
        2. Enter your OpenAI API Key when prompted.
    * **Command Line Interface (CLI):**
        1. **Install Dependencies:**
           ```bash
           npm install
           ```
        2. **Set Environment Variables:** Create a `.env` file in the root directory and add your API key:
           ```
           API_KEY=your_api_key_here
           ```
        3. **Run the Game:**
           ```bash
           npm start
           ```

### Demo

You can also try a live demo of the game at [rajatasusual.github.io/gemini-mud/](https://rajatasusual.github.io/gemini-mud/). 


### Disclaimer

Please note that this is a text-based game and relies heavily on your imagination to bring the world to life.  The AI-generated content may vary in quality and coherence.

## Contributing

Contributions are welcome! Please feel free to submit bug reports, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

**Enjoy your adventure in the ever-evolving world of Gemini MUD!** 

**Please let me know if you have any other questions.** 
