import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Polyfill for Promise.withResolvers for older browser compatibility.
// This is used by dependencies like pdfjs-dist and may not be present in all environments.
if (!(Promise as any).withResolvers) {
  (Promise as any).withResolvers = function withResolvers<T>() {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    // The non-null assertion (!) is safe here because the promise executor runs synchronously.
    return { promise, resolve: resolve!, reject: reject! };
  };
}

/*
// Register Service Worker for PWA functionality - Disabled due to cross-origin issues in the environment.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
*/


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);