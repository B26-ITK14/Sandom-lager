/*
 * Dashboard.tsx
 */

import Layout from "../components/Layout";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import ToggleThemeButton from "../components/ToggleThemeButton";
import { AUTH0_AUDIENCE } from "../config/auth";
import { useUppercaseUsername } from "../hooks/user/useName";

export default function HomePage() {
    const username = useUppercaseUsername();
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    // Debugging: Log access token to verify Auth0 integration
    useEffect(() => {
        async function debugToken() {
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: AUTH0_AUDIENCE,
                    },
                });
                console.log("ACCESS TOKEN:", token);
            } catch (error) {
                console.error("Error fetching access token:", error);
            }
        }
        if (isAuthenticated) {
            debugToken();
        }
    }, [getAccessTokenSilently, isAuthenticated]);

    return (
        <Layout>
            <section className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-normal">Velkommen!</h1>
                <div className="flex gap-3">
                    <ToggleThemeButton
                        lightText="Bytt til lys"
                        darkText="Bytt til mørk"
                        className="py-2 px-4 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                    />
                </div>
            </section>
            <p style={{ color: "var(--color-text-secondary)" }}>
                Dette er hovedapplikasjonen. Du er logget inn som:{" "}
                <strong>{username}</strong>
            </p>
        </Layout>
    );
}
