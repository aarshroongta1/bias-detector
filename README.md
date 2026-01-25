# Bias Detector

An AI-powered tool that detects implicit biases in your writing and suggests more inclusive alternatives. Available as a Chrome extension, Google Docs add-on, and Outlook add-in.


**Website**: https://bias-detector-iota.vercel.app/

**Walkthrough:** https://drive.google.com/file/d/1x85-O82W5y-5EQriJpxmVpyQIL288gfZ/view?usp=sharing

## Features

- **Address Implicit Biases** - identifies language that could be biased and offensive so that you feel confident in what you write
- **Contextual Explanation** - understand the type of bias and why it may be a problem
- **Smart Suggestions** - more inclusive alternatives that exactly replace your biases in one click
- **Multi-platform** - works across Chrome, Gmail, Outlook, Slack, Google Docs, and all other tools on the internet.

### Bias Categories

- Gender
- Age
- Ability
- Socioeconomic
- Ethnic
- Racial

and many others.


## Project Structure

```
bias-detector/
├── chrome-extension/    # Chrome browser extension (Plasmo)
├── google-addon/        # Google Docs add-on (Apps Script)
├── outlook-addon/       # Outlook add-in (Office.js)
├── server/              # Backend API (Express + OpenAI)
└── website/             # Landing page (Vite + React)
```



## Tech Stack

| Component | Technologies |
|-----------|-------------|
| Chrome Extension | Plasmo, React, TypeScript |
| Google Add-on | Google Apps Script |
| Outlook Add-in | Office.js, React |
| Backend | Express.js, OpenAI API, Render Deployment |
| Website | Vite, React, TypeScript, Vercel Deployment |



## License

MIT
