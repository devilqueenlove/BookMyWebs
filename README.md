# BookMyWebs - Modern Bookmark Manager

![BookMyWebs Banner](https://github.com/devilqueenlove/BookMyWebs/raw/main/public/banner.png)

## Overview

BookMyWebs is a modern, feature-rich bookmark manager designed to help you organize and access your web bookmarks from anywhere. Built with React, Vite, and Tailwind CSS, it offers a beautiful, responsive UI with dynamic theming, Firebase authentication, and cloud sync capabilities.

## Features

### Core Features
- **Bookmark Management**: Add, edit, delete, and organize bookmarks with ease
- **Search & Filter**: Quickly find bookmarks by title, URL, or description
- **Category Organization**: Organize bookmarks into customizable categories
- **Multiple View Modes**: Toggle between grid and list views for your bookmarks
- **Dynamic Theming**: Light/dark mode and customizable accent colors
- **Cloud Sync**: Firebase-powered data synchronization across devices
- **User Authentication**: Secure login with email/password and Google authentication
- **Responsive Design**: Works beautifully on all devices from mobile to desktop

### UI/UX Features
- **Modern Interface**: Clean, intuitive design with attention to detail
- **Fast Performance**: Built with React and optimized for speed
- **Card & List Views**: Multiple ways to visualize your bookmarks
- **Smart Favicon Detection**: Automatically fetches website icons
- **Rich Text Formatting**: Support for descriptions and notes
- **Automatic Categorization**: Smart categorization of bookmarks based on URL patterns
- **Import/Export**: Backup and restore your bookmark collection
- **Settings Panel**: Customize your experience with various preferences

## Technologies Used

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Firebase (Authentication & Firestore)
- **State Management**: React Context API
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React
- **Package Management**: npm

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- A Firebase project (for authentication and database)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/devilqueenlove/BookMyWebs.git
   cd BookMyWebs
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Firebase
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Email/Password and Google authentication in the Authentication section
   - Set up Firestore database with appropriate security rules
   - Create a `src/firebase/config.js` file with your Firebase configuration:

   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Build for production
   ```bash
   npm run build
   ```

## Project Structure

```
/src
  /components
    /auth        # Authentication components (Login, Signup, AuthModal)
    /bookmarks   # Bookmark-related components (BookmarkForm, BookmarkList)
    /layout      # Layout components (Header, Sidebar)
    /ui          # Reusable UI components
  /contexts     # React Context providers (AuthContext, ThemeContext)
  /firebase     # Firebase configuration
  /utils        # Utility functions including bookmark categorization
  App.jsx       # Main application component
  main.jsx      # Entry point
```

## Implementation History

### Key Milestones

1. Initial Development (v0.1.0)
   - Core bookmark management functionality
   - Local storage persistence
   - Basic UI with Tailwind CSS

2. UI Enhancement (v0.2.0)
   - Added grid and list view modes
   - Improved responsive design
   - Enhanced search functionality

3. Firebase Integration (v0.3.0)
   - Added Firebase Authentication
   - Implemented Firestore for bookmark storage
   - Cloud sync across devices
   - User profile management

4. Theme System (v0.4.0)
   - Implemented dynamic theme support
   - Added light/dark mode toggle
   - Created customizable accent colors
   - Enhanced UI components with theme support

### Recent Changes

#### Firebase Authentication Implementation (v0.5.0)
- Integrated Firebase Authentication with email/password and Google login
- Created AuthContext for managing authentication state
- Implemented Login and Signup components with form validation
- Built AuthModal for toggling between login/signup views
- Replaced localStorage with Firestore for bookmark and category storage
- Added real-time data synchronization with Firestore

#### Auto-Categorization Feature (v0.5.1)
- Added automatic categorization of bookmarks based on URL patterns
- Implemented utilities for intelligent category suggestion
- Added bulk categorization feature in settings panel

## Authentication and Data Management

### Firebase Authentication
BookMyWebs implements secure user authentication through Firebase, offering:
- Email/password authentication with validation
- One-click Google account login
- Password reset functionality
- Persistent login sessions
- Protected routes for authenticated users

### Firestore Database Integration
- Real-time data synchronization across devices
- Secure data storage with proper authentication rules
- Cloud backup of all bookmarks and categories
- Optimized queries for fast performance

## Setting Up Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to Authentication section and enable:
   - Email/Password provider
   - Google provider
4. Set up Firestore Database:
   - Create a new database in production mode
   - Configure security rules to secure your data

Example Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookmarks/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /categories/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Roadmap

### Upcoming Features

1. Browser Extension
   - Quick bookmark adding from any webpage
   - Context menu integration
   - Synchronization with the web app

2. Enhanced Organization
   - Drag & drop sorting and reordering
   - Nested categories/folders
   - Tagging system with multiple tags per bookmark
   - Improved auto-categorization with machine learning

3. Social Features
   - Bookmark sharing with friends
   - Collaborative bookmark collections
   - Public/private bookmark lists
   - Follow other users' public collections

4. Advanced Features
   - Offline support & sync queue
   - Bookmark previews (screenshots)
   - Advanced search with filters
   - Bookmark analytics and suggestions
   - Browser history integration

## How to Use

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Add Bookmarks**: Click the "+" button to add new web bookmarks
3. **Organize**: Create categories and assign bookmarks to them
4. **Search & Filter**: Use the search bar or category filters to find bookmarks
5. **Customize**: Change theme and appearance in settings
6. **Import/Export**: Backup your bookmarks or import from other sources

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Lucide Icons](https://lucide.dev/)