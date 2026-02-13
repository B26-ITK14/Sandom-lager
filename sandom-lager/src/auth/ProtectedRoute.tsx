import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <p>Laster inn...</p>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
