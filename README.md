# Bias Detector

An AI-powered tool that detects implicit biases in your writing and suggests more inclusive alternatives. Available as a Chrome extension, Google Docs add-on, and Outlook add-in.

## Features

- **Real-time Detection** - Identifies biased language as you write
- **Inline Highlighting** - Visual indicators show exactly where biases appear
- **Smart Suggestions** - AI-powered replacements for more inclusive language
- **One-click Fixes** - Apply suggestions instantly with a single click
- **Multi-platform** - Works across Chrome, Google Docs, and Outlook

### Bias Categories

| Category | Description |
|----------|-------------|
| Gender | Gender-specific language and assumptions |
| Age | Age-related stereotypes and assumptions |
| Racial | Racially insensitive terminology |
| Ethnic | Ethnicity-based assumptions |
| Ability | Ableist language |
| Socioeconomic | Class-based assumptions |

## Project Structure

```
bias-detector/
├── chrome-extension/    # Chrome browser extension (Plasmo)
├── google-addon/        # Google Docs add-on (Apps Script)
├── outlook-addon/       # Outlook add-in (Office.js)
├── server/              # Backend API (Express + OpenAI)
└── website/             # Landing page & demo (Vite + React)
```

## Quick Start

### Prerequisites

- Node.js v18+
- pnpm or npm
- OpenAI API key

### 1. Start the Backend

```bash
cd server
npm install
echo "OPENAI_API_KEY=your_key_here" > .env
npm run dev
```

Server runs at `http://localhost:3000`

### 2. Run the Chrome Extension

```bash
cd chrome-extension
pnpm install
pnpm dev
```

Then load in Chrome:
1. Navigate to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `chrome-extension/build/chrome-mv3-dev`

### 3. Run the Website

```bash
cd website
npm install
npm run dev
```

Website runs at `http://localhost:5173`

### 4. Google Docs Add-on

The Google add-on uses Apps Script. See `google-addon/` for deployment instructions.

### 5. Outlook Add-in

```bash
cd outlook-addon
npm install
npm run dev
```

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| Chrome Extension | Plasmo, React, TypeScript |
| Google Add-on | Google Apps Script |
| Outlook Add-in | Office.js, React |
| Backend | Express.js, OpenAI API |
| Website | Vite, React, TypeScript |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
