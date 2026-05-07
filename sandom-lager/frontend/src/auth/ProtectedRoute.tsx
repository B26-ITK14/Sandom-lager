/*
    * ProtectedRoute.tsx
    * A higher-order component that wraps around protected routes in the application, ensuring that only authenticated users can access them.
    * It uses the Auth0 React SDK to check the user's authentication status and either renders the protected content or redirects to the login page.
 */

import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react"; 
import type { ReactNode } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchMyLocationAccess } from "../api/userLocations";
import { ROUTES } from "../router/routes";
import { ACCESS_STATUS, type AccessStatus } from "../constants/accessStatus";

type LocationStatus = "loading" | "none" | AccessStatus;

type Props = {
  children: ReactNode;
  requireLocation?: boolean;
};

export default function ProtectedRoute({ children, requireLocation = true }: Props) { 
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0(); 
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");

  useEffect(() => {
    if (!isAuthenticated || !requireLocation) {
      setLocationStatus(ACCESS_STATUS.APPROVED);
      return;
    }

    async function checkLocation() {
    try {
        const token = await getAccessTokenSilently();
        const data = await fetchMyLocationAccess(token);
        if (data.length === 0) {
            setLocationStatus("none");
        } else {
            const hasApproved = data.some((d) => d.access_status === ACCESS_STATUS.APPROVED);
            const hasPending = data.some((d) => d.access_status === ACCESS_STATUS.PENDING);

            if (hasApproved) {
              setLocationStatus(ACCESS_STATUS.APPROVED);
            } else if (hasPending) {
              setLocationStatus(ACCESS_STATUS.PENDING);
            } else {
              setLocationStatus(ACCESS_STATUS.DENIED);
            }
        }
    } catch {
        setLocationStatus("none");
    }
}
    checkLocation();
  }, [isAuthenticated, requireLocation, getAccessTokenSilently]);

  if (isLoading || locationStatus === "loading") return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requireLocation) {
    if (locationStatus === "none") return <Navigate to={ROUTES.REQUEST_ACCESS.path} replace />;
    if (locationStatus === ACCESS_STATUS.PENDING || locationStatus === ACCESS_STATUS.DENIED) return <Navigate to={ROUTES.PENDING_APPROVAL.path} replace />;
  }

  return <>{children}</>;
}