import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/App.css";
import App from "./App.tsx";

import { Auth0Provider } from "@auth0/auth0-react";
import type { AppState } from "@auth0/auth0-react";
import { AUTH0_AUDIENCE, AUTH0_SCOPE } from "./config/auth";
import { env } from "./config/env";

// Register Service Worker for offline support and caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(() => {
        // Ignore service worker registration failures in development.
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

// TEMP DEBUG: log build-time VITE_ env values to help verify Cloudflare Pages injected them.
// Remove this after verification.
try {
  // eslint-disable-next-line no-console
  console.log("[DEBUG VITE] VITE_AUTH0_DOMAIN=", import.meta.env.VITE_AUTH0_DOMAIN);
  // eslint-disable-next-line no-console
  console.log("[DEBUG VITE] VITE_AUTH0_CLIENT_ID=", import.meta.env.VITE_AUTH0_CLIENT_ID);
  // eslint-disable-next-line no-console
  console.log("[DEBUG VITE] VITE_API_BASE_URL=", import.meta.env.VITE_API_BASE_URL);
} catch (e) {
  // ignore runtime errors here
  console.log(e);
}

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
