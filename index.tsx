import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './presentation/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

import { BrowserRouter } from 'react-router-dom';

// Global Error Handlers
const handleGlobalError = (event: ErrorEvent) => {
  // Handle ChunkLoadError (when new deployment happens and old chunks are missing)
  if (event.message && (
    event.message.includes('Failed to fetch dynamically imported module') ||
    event.message.includes('Importing a module script failed')
  )) {
    console.warn('⚠️ Chunk load error detected. Reloading page to fetch new version...');
    // Prevent infinite reload loop
    if (!sessionStorage.getItem('chunk_reload_lock')) {
      sessionStorage.setItem('chunk_reload_lock', 'true');
      window.location.reload();
    } else {
      sessionStorage.removeItem('chunk_reload_lock');
    }
  }
};

// Add event listener
window.addEventListener('error', handleGlobalError);

// Suppress ResizeObserver loop limit errors (benign)
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop limit exceeded') {
    const resizeObserverErrDiv = document.getElementById(
      'webpack-dev-server-client-overlay-div'
    );
    const resizeObserverErr = document.getElementById(
      'webpack-dev-server-client-overlay'
    );
    if (resizeObserverErr) {
      resizeObserverErr.setAttribute('style', 'display: none');
    }
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.setAttribute('style', 'display: none');
    }
  }
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);