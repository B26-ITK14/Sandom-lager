/*
    * main.tsx
    * The entry point of the Sandom Lager frontend application. It sets up the Auth0 authentication provider, registers a service worker for offline support, and renders the main App component within the appropriate context providers.
*/

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/App.css";
import App from "./App.tsx";

import { Auth0Provider } from "@auth0/auth0-react";
import type { AppState } from "@auth0/auth0-react";
import { AUTH0_AUDIENCE, AUTH0_SCOPE } from "./config/auth";
import { env } from "./config/env";

// Register Service Worker for offline support and caching
// DISABLED IN DEVELOPMENT to avoid intercepting API calls
// Enable only in production builds
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(() => {
        // Ignore service worker registration failures.
      });
  });
}

const savedReducedMotion = window.localStorage.getItem('app:reducedMotion');
if (savedReducedMotion) {
  try {
    const isReducedMotion = JSON.parse(savedReducedMotion) === true;
    document.documentElement.classList.toggle('reduce-motion', isReducedMotion);
  } catch {
    document.documentElement.classList.remove('reduce-motion');
  }
}

const savedHighContrast = window.localStorage.getItem('app:highContrast');
if (savedHighContrast) {
  try {
    const isHighContrast = JSON.parse(savedHighContrast) === true;
    document.documentElement.classList.toggle('high-contrast', isHighContrast);
  } catch {
    document.documentElement.classList.remove('high-contrast');
  }
}

const onRedirectCallback = (appState?: AppState) => {
  const target = appState?.returnTo ?? window.location.pathname;
  window.history.replaceState({}, document.title, target);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={env.VITE_AUTH0_DOMAIN}
      clientId={env.VITE_AUTH0_CLIENT_ID}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: AUTH0_SCOPE,
        audience: AUTH0_AUDIENCE,
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
