# 🧬 Cellular Automata Sandbox Explorer

Ever get lost watching complex, beautiful patterns emerge from a few simple rules? That's the magic of cellular automata, and this project is your personal playground to explore it.

This isn't just another Game of Life simulator. It's a full-blown sandbox where you can invent your own rules, share them with others, and discover what the community is creating. It's all built with React, TypeScript, and runs the heavy calculations in a Web Worker so the UI stays super smooth.

## ✨ So, What Can You Do?

-   **Go Wild on an Infinite Canvas**: The grid is huge, and you can pan and zoom to your heart's content. Get lost in the details or step back to see the bigger picture.
-   **Invent Your Own Universe**: Don't just stick with Conway's rules. Create your own with the simple `B/S` (Birth/Survival) notation. What happens in a `B2/S345` world? Go find out.
-   **Crank Up the Speed**: Animate your creations in real-time, from a slow, methodical pace to a blazing-fast 400 FPS.
-   **Draw, Don't Just Click**: Click and drag your mouse across the grid to draw patterns quickly. No more tedious pixel-by-pixel clicking.
-   **Visit the Marketplace**: Check out the "Rule Marketplace" to browse, vote on, and "subscribe" to rules created by the community. Found a cool one? Import it into your sandbox with one click.
-   **Share Your Creations**: Got a rule that creates amazing patterns? Give it a name, a description, and submit it to the marketplace for others to discover.

## 🚀 Getting It Running

Ready to jump in? You just need Node.js and npm.

1.  **Clone the repo:**
    ```bash
    git clone <your-repo-url>
    cd cellular-automata-sandbox
    ```

2.  **Install the stuff:**
    ```bash
    npm install
    ```

3.  **Fire it up:**
    ```bash
    npm start
    ```

    It should open up automatically at `http://localhost:3000`.

## 🎮 How to Play

Once it's running, it's pretty straightforward:

-   **Draw**: Left-click and drag on the grid.
-   **Pan**: Right-click and drag.
-   **Zoom**: Use your mouse wheel.
-   The **Controls** panel on the right is where you can play/pause, step through the simulation, change the speed, and invent new rules.

Don't know where to start? Click the **"How to Play"** button in the header for a quick rundown of the controls!

## 🏗️ The Tech Behind It

I wanted this to be a modern, snappy web app, so I used:

-   **React & TypeScript**: For a solid, type-safe foundation.
-   **Web Workers**: To make sure the simulation logic never freezes the main UI thread. This is key for a smooth experience at high speeds.
-   **HTML5 Canvas**: For efficiently rendering thousands of cells.
-   **Tailwind CSS**: To build the UI quickly and keep it looking clean.
-   **Jest**: For running the unit tests on the important utility functions.

## 🤝 Wanna Help Out?

This project was a ton of fun to build, and there's always more that can be added. If you have an idea, find a bug, or want to add a new feature:

1.  Fork the repo.
2.  Create a new branch for your feature (`git checkout -b feature/my-cool-idea`).
3.  Make your changes.
4.  Submit a pull request!

Let's build cool stuff together.

---

Enjoy the sandbox!
