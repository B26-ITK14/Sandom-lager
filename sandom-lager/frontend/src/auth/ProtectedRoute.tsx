/*
    * ProtectedRoute.tsx
    * A higher-order component that wraps around protected routes in the application, ensuring that only authenticated users can access them.
    * It uses the Auth0 React SDK to check the user's authentication status and either renders the protected content or redirects to the login page.
 */

import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import type { ReactNode } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
