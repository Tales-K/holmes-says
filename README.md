# Holmes Says

[Live Site](https://tales-k.github.io/holmes-says/)

> A modern, glassmorphism React app for transcribing and summarizing audio using OpenAI Whisper, with persistent history and GitHub Pages deployment.

## Features

- **Audio Transcription:** Upload MP3 or OGG files and transcribe them using OpenAI Whisper API.
- **Summarization:** Summarize transcriptions or history items using OpenAI GPT-4o.
- **API Key Management:** Enter and persist your OpenAI API key securely in local storage.
- **History:** All transcriptions and summaries are saved in local storage for future access.
- **Download:** Download any transcription as a text file.
- **Language Switcher:** Toggle between Portuguese (pt-BR) and English (EN) for UI and summarization.
- **Modern UI:** Responsive, dark-themed glassmorphism interface using MUI and custom CSS.
- **GitHub Pages Deployment:** Automatic deployment via GitHub Actions.

## How It Works

1. **Enter your OpenAI API key** ([create one here](https://platform.openai.com/account/api-keys)).
2. **Upload an audio file** (MP3 or OGG).
3. **Transcribe:** The app sends the file to OpenAI Whisper and displays the transcription.
4. **Summarize:** Click to summarize the transcription or any history item using GPT-4o.
5. **Download:** Save any transcription as a `.txt` file.
6. **History:** All transcriptions and summaries are saved locally and shown in the history panel.
7. **Language:** Switch between Portuguese and English for UI and summary output.

## Technologies Used

- React 19
- Vite
- Material UI (MUI)
- FontAwesome
- react-dropzone
- file-saver
- OpenAI API (Whisper, GPT-4o)
- GitHub Actions & Pages

## Deployment

The site is automatically deployed to GitHub Pages on every push to `main` using [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages).

- **URL:** [https://Tales-K.github.io/holmes-says](https://Tales-K.github.io/holmes-says)

## Local Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
# Output in dist/
```
Push to `main` to trigger GitHub Actions deployment.

## License

MIT
