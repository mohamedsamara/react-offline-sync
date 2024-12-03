# React Offline Sync

React Offline Sync is a web application built with React for managing notes. It includes core features for creating, editing, and organizing notes, along with support for offline access and automatic syncing when back online. The app leverages service workers and websockets for real-time updates and background processes.

## Features

- Progressive Web App (PWA): Works offline and can be installed for use on mobile and desktop.
- Offline Functionality: Create, edit, and delete notes without an internet connection. Data is stored using IndexedDB.
- Background Syncing: Changes are synced automatically when the device is online. The app uses a Last Write Wins approach to apply the most recent changes.
- Push Notifications: Notifications alert users to updates on their notes.
- Real-Time Updates with WebSocket: Provides real-time updates and collaboration.
- Code Splitting: Improves initial load performance by loading only the necessary code.

## Setup Instructions

1. Start the Backend Server and Frontend

   To start the server and frontend together, use the following steps:

   1. Install dependencies: First, navigate to your project directory and install the required dependencies for both the client and server.

      ```bash
      yarn install
      ```

   2. Start both server and frontend: To start both the backend and frontend at the same time, run the dev script from your root project directory. This will run the server (Express API) and the frontend (React app) concurrently.

      ```bash
      yarn dev
      ```

2. Build the Application for Production

   To create a production build of the app (both frontend and backend), run:

   ```bash
   yarn build
   ```

   After building the app, you can start both the server and frontend in production mode using:

   ```bash
   yarn start
   ```

3. Generate VAPID Keys for Web Push

   First, navigate to server directory and run the command:

   ```bash
   npx web-push generate-vapid-keys
   ```

4. ENV

   Create `.env` file for both client and server. See examples:

   [Frontend ENV](client/.env.example)

   [Backend ENV](server/.env.example)
