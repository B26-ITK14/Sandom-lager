import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/App.css";
import App from "./App.tsx";

import { Auth0Provider } from "@auth0/auth0-react";
import { AUTH0_AUDIENCE, AUTH0_SCOPE } from "./config/auth";
import { env } from "./config/env";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={env.VITE_AUTH0_DOMAIN}
      clientId={env.VITE_AUTH0_CLIENT_ID}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: AUTH0_SCOPE,
        audience: AUTH0_AUDIENCE,
      }}

      // La til denne linjen for å bli redirected til "Admin siden"
        cacheLocation="localstorage"

    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
