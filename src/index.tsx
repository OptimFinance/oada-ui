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

// <React.StrictMode>
// </React.StrictMode>
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
