import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Polyfills for simple-peer in browser environment
import { Buffer } from 'buffer';
import process from 'process';

// Make polyfills globally available
window.Buffer = Buffer;
window.process = process;

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);