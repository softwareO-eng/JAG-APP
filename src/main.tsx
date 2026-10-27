console.log("main.tsx: STARTING EXECUTION");
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("main.tsx: Imports completed");

window.onerror = function(message, source, lineno, colno, error) {
  console.log("main.tsx: GLOBAL ERROR CAUGHT", message);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:red;color:white;padding:20px;font-family:monospace;';
  errorDiv.innerHTML = `<h3>Global Error</h3>${message}<br><small>${source}:${lineno}</small>`;
  document.body.appendChild(errorDiv);
};

try {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(<StrictMode><App /></StrictMode>);
    console.log("main.tsx: Render called");
  } else {
    console.error("main.tsx: Root element not found");
  }
} catch (e: any) {
  console.error("main.tsx: Render crash", e);
}

