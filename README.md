# BookMyWebs

Modern bookmark manager with a companion Chrome extension. Save, organize, and access your bookmarks from anywhere with real-time sync.

![Banner](https://github.com/devilqueenlove/BookMyWebs/raw/main/public/banner.png)

## Core Features

- **Smart Storage**: Auto-categorizes bookmarks using heuristic URL patterns.
- **Link Health**: Real-time monitoring of website availability.
- **Visual UI**: Premium grid/list views with dynamic dark mode.
- **Cloud Sync**: Securely powered by Firebase and Firestore.

## Quick Start

1. **Install Dependencies**: `npm install`
2. **Setup Firebase**: Add your config to `src/firebase/config.js`.
3. **Run Dev**: `npm run dev`
4. **Build**: `npm run build`

## Chrome Extension

Save tabs instantly without leaving your current page.

1. Go to `chrome://extensions/` and enable **Developer mode**.
2. Click **Load unpacked** and select the `/extension` folder.
3. Authenticate by having the BookMyWebs web app open in another tab.

## Structure

- `/src`: Main React application (UI, logic, Firebase).
- `/extension`: Chrome Manifest V3 extension source.