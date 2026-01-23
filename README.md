# Bias Detector

A multi-platform AI-powered tool that detects implicit biases in written text and suggests more inclusive alternatives.

## Features

- Real-time bias detection as you write
- Suggestions for more inclusive language
- Support for multiple platforms (Chrome, Outlook, Google Docs)
- Detects various bias categories:
  - **Gender** - Gender-specific language and assumptions
  - **Age** - Age-related stereotypes and assumptions
  - **Ethnic** - Ethnicity-based assumptions
  - **Ability** - Ableist language
  - **Socioeconomic** - Class-based assumptions
  - **Racial** - Racially insensitive terminology

## Project Structure

```
bias-detector/
├── chrome-extension/    # Chrome browser extension (Plasmo)
├── website/             # Landing page and demo (Vite + React)
├── outlook-addins/      # Microsoft Outlook add-in (Webpack)
└── server/              # Backend API server (Express + OpenAI)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- OpenAI API key

### Environment Variables

Create a `.env` file in the `server` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Installation

#### Backend Server

```bash
cd server
npm install
npm run dev
```

The server runs on `http://localhost:3000` by default.

#### Chrome Extension

```bash
cd chrome-extension
pnpm install
pnpm dev
```

Load the extension in Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension/build/chrome-mv3-dev` directory

#### Website

```bash
cd website
npm install
npm run dev
```

The website runs on `http://localhost:5173` by default.

#### Outlook Add-in

```bash
cd outlook-addins
npm install
npm run dev
```

## Tech Stack

- **Frontend**: React, TypeScript, CSS
- **Chrome Extension**: Plasmo Framework
- **Backend**: Express.js, OpenAI API
- **Build Tools**: Vite, Webpack

## License

MIT
