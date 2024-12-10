// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApiServiceFactory } from './services/core/ApiServiceFactory';
import './index.css';

ApiServiceFactory.initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);