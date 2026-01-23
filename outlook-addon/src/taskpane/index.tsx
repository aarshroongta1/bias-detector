import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/* global document, Office */

let isOfficeInitialized = false;

const render = (Component: React.ComponentType) => {
  const rootElement = document.getElementById("container");
  if (!rootElement) {
    throw new Error("Could not find container element");
  }
  
  const root = createRoot(rootElement);
  root.render(<Component />);
};

/* Render application after Office initializes */
Office.onReady(() => {
  isOfficeInitialized = true;
  render(App);
});

if (!isOfficeInitialized) {
  Office.onReady(() => {
    isOfficeInitialized = true;
  });
}