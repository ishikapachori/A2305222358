// A2305222358/Frontend Test Submission/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { registerUser, authenticateUser, logEvent } from './logger';

const root = ReactDOM.createRoot(document.getElementById('root'));

async function initializeApp() {
  try {
    await registerUser();
    await authenticateUser();
    logEvent("frontend", "info", "app", "Application started successfully.");
  } catch (error) {
    console.error("Failed to initialize authentication or logging:", error);
    logEvent("frontend", "fatal", "app", `Application failed to initialize: ${error.message}`);
  } finally {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

initializeApp();

reportWebVitals();
