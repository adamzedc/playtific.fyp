# Playtifix App

Overview
Playtific is an AI-powered gamification app that helps users achieve their goals by generating personalized roadmaps. Users can input their goals and timeframes, and the app will create a roadmap with milestones and tasks. Gamification elements such as experience points (XP), levels, streaks, and achievements are integrated to keep users motivated and engaged.

Features
Core Features
AI-Powered Roadmap Generation:

Users input their goals and timeframes.
The app generates monthly milestones and weekly tasks using OpenAI's API.
Daily and Weekly Task Management:

Daily tasks are derived from weekly tasks and tracked for completion.
Weekly tasks are automatically assigned and updated.
Gamification Elements:

XP & Levels: Users earn XP for completing tasks and level up as they progress.
Daily Streaks: Tracks consecutive days of task completion.
Achievements: Unlock badges for milestones like maintaining streaks or completing roadmaps.
Saved Roadmaps:

Users can view and expand their saved roadmaps, including milestones and tasks.
Authentication:

Secure user authentication using Firebase Authentication.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

Playtifix is built to streamline workflows and deliver a seamless user experience. Whether you're looking to improve productivity or integrate advanced functionalities into your application, Playtifix provides a solid foundation.


## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher)
- [npm](https://www.npmjs.com/)

npm install -g expo-cli

### Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/playtifix.git
   ```
2. **Navigate into the Project Directory:**
   ```bash
   cd playtifix.app
   ```
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Start the Application:**
   ```bash
   npm start
   ```

## Usage

After installation, start the application and visit [http://localhost:3000](http://localhost:3000) in your browser. For more detailed instructions, refer to the [User Documentation](docs/USAGE.md).

## Contributing

Contributions are welcome! To contribute:

- Fork this repository.
- Create a feature branch for your changes.
- Adhere to the project's coding standards.
- Submit a pull request with a detailed description of your improvements.

For more details, please see the [Contributing Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE). Please review the LICENSE file for more details.

## Contact

For questions or support, please reach out via email at [email@example.com](mailto:email@example.com) or open an issue on GitHub.

Happy coding!

notes
- to update date manually, go tp desSetting.ts under config and add 1 to the right 0, save then the app should simulate 1 day has passed.