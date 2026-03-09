import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/App.css";
import App from "./App.tsx";

import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: "openid profile email username",
        audience: "https://sandom-api"
      }}

      // La til denne linjen for å bli redirected til "Admin siden"
        cacheLocation="localstorage"

    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
