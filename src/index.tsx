/**
 * Application Entry Point
 * 
 * This is the main entry point for the React application that:
 * - Initializes the React application
 * - Sets up global providers (Redux, Helmet, WebSocket)
 * - Configures service worker for offline capabilities
 * - Imports global styles
 */

import React from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import "./main.css";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import { HelmetProvider } from "react-helmet-async";
import WebsocketProvider from "./websocket";

/**
 * Application Root Setup
 * 
 * Creates and renders the root React component with all necessary providers:
 * - HelmetProvider: Manages document head tags
 * - Redux Provider: Manages global application state
 * - WebSocket Provider: Handles real-time communication
 */
const root = createRoot(document.getElementById("root")!);
root.render(
  <HelmetProvider>
    <Provider store={store}>
      <WebsocketProvider>
        <App />
      </WebsocketProvider>
    </Provider>
  </HelmetProvider>
);

// Note: React.StrictMode is currently commented out
// <React.StrictMode>
// </React.StrictMode>

/**
 * Service Worker Configuration
 * 
 * Currently unregistered to prevent offline caching.
 * To enable offline capabilities and faster loading:
 * 1. Change unregister() to register()
 * 2. Be aware of potential pitfalls with service workers
 * 3. Learn more at: https://bit.ly/CRA-PWA
 */
serviceWorker.unregister();
