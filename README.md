
# VerozTax PPh 21 Calculator (Desktop Version)

This project has been converted to an Electron application. Follow the steps below to build the Windows `.exe` file.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js installed (LTS version recommended). You can download it from [nodejs.org](https://nodejs.org/).

## Setup and Installation

1.  Open your terminal or command prompt in the project root directory.
2.  Install the required dependencies:

    ```bash
    npm install
    ```

## Running in Development Mode

To run the application locally for testing:

1.  Start the Vite development server and Electron simultaneously:

    ```bash
    npm run dev
    # In a separate terminal:
    npm run electron:start
    ```
    *(Note: You may need to wait for Vite to start before running Electron)*

## Building the Windows EXE

To generate the standalone Windows installer (`.exe`):

1.  Run the distribution command:

    ```bash
    npm run dist
    ```

2.  This process will:
    *   Compile the TypeScript/React code using Vite into the `dist/` folder.
    *   Package the application using `electron-builder`.

3.  Once finished, you will find the installer file in the **`release/`** directory (e.g., `VerozTax Setup 1.0.0.exe`).

## Important Note on Offline Use

The current build still references `Tailwind CSS`, `html2canvas`, and `jspdf` via CDN (internet links) in `index.html`. For a completely offline experience, you should download these library files, place them in a `public/libs` folder, and update `index.html` to reference the local files instead.
