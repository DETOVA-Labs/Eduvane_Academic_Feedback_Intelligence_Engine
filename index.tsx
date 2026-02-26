/**
 * Overview: index.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */


import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
