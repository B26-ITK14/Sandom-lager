/*
    * PostAuthRedirectPage.tsx
    * A page that handles redirection after authentication based on the user's location access status.
    * It checks if the user has approved, pending, or no access to any location and redirects accordingly.
    * Shows a loading spinner while checking the access status.
    * Author: Emil Berglund
 */

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { fetchMyLocationAccess } from "../../api/userLocations";
import { ROUTES } from "../../router/routes";
import { ACCESS_STATUS } from "../../constants/accessStatus";

export default function PostAuthRedirectPage() {
    const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (isLoading || !isAuthenticated) {
            return;
        }

        let cancelled = false;

        async function resolveAccessRedirect() {
            try {
                const token = await getAccessTokenSilently();
                const accessRows = await fetchMyLocationAccess(token);

                if (cancelled) return;

                if (accessRows.length === 0) {
                    navigate(ROUTES.REQUEST_ACCESS.path, { replace: true });
                    return;
                }

                const hasApproved = accessRows.some((row) => row.access_status === ACCESS_STATUS.APPROVED);
                const hasPending = accessRows.some((row) => row.access_status === ACCESS_STATUS.PENDING);

                if (hasApproved) {
                    navigate(ROUTES.DASHBOARD.path, { replace: true });
                    return;
                }

                if (hasPending) {
                    navigate(ROUTES.PENDING_APPROVAL.path, { replace: true });
                    return;
                }

                navigate(ROUTES.PENDING_APPROVAL.path, { replace: true });
            } catch {
                if (!cancelled) {
                    navigate(ROUTES.REQUEST_ACCESS.path, { replace: true });
                }
            } finally {
                if (!cancelled) {
                    setChecking(false);
                }
            }
        }

        void resolveAccessRedirect();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, isLoading, getAccessTokenSilently, navigate]);

    if (!isLoading && !isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN.path} replace />;
    }

    if (isLoading || checking) {
        return (
            <main
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner />
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Sjekker tilgang og lokasjon...
                    </p>
                </div>
            </main>
        );
    }

    return null;
}
