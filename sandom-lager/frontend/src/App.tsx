/*
    * App.tsx
    * The main application component that sets up routing, context providers, and lazy loading for the Sandom Lager frontend. It defines the structure of the application and manages access to different pages based on authentication and user roles.
*/

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { SelectedRecipesProvider } from "./context/SelectedRecipesContext";
import { UserProvider } from "./context/UserContext";
import { AuthErrorProvider } from "./context/AuthErrorContext";
import { ProtectedRoute } from "./auth";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load page components to reduce initial bundle size
const LoginPage = lazy(() => import("./pages/LoginPage"));
const HomePage = lazy(() => import("./pages/Dashboard"));
const ShoppingListPage = lazy(() => import("./pages/ShoppingListPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const StoragePage = lazy(() => import("./pages/StoragePage"));
const RecipesPage = lazy(() => import("./pages/RecipesPage"));
const MyAccountPage = lazy(() => import("./pages/settings/MyAccountPage"));
const MyApplicationsPage = lazy(() => import("./pages/settings/MyApplicationsPage"));
const AppSettingsPage = lazy(() => import("./pages/settings/AppSettingsPage"));
const AboutSandomLagerPage = lazy(() => import("./pages/settings/AboutSandomLagerPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const RequestAccessPage = lazy(() => import("./pages/onboarding/RequestAccessPage"));
const PendingApprovalPage = lazy(() => import("./pages/onboarding/PendingApprovalPage"));
const PostAuthRedirectPage = lazy(() => import("./pages/auth/PostAuthRedirectPage"));

import { ROUTES } from "./router/routes";

// Fallback component while loading pages
const PageFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-background)',
  }}>
    <LoadingSpinner />
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthErrorProvider>
          <UserProvider>
            <SelectedRecipesProvider>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  {/* Public route */}
                  <Route path={ROUTES.LOGIN.path} element={<LoginPage />} />

                  {/* Post-auth loading gate */}
                  <Route
                    path={ROUTES.POST_AUTH.path}
                    element={
                      <ProtectedRoute requireLocation={false}>
                        <PostAuthRedirectPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Onboarding – krever innlogging, men ikke godkjent lokasjon */}
                  <Route
                    path={ROUTES.REQUEST_ACCESS.path}
                    element={
                      <ProtectedRoute requireLocation={false}>
                        <RequestAccessPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PENDING_APPROVAL.path}
                    element={
                      <ProtectedRoute requireLocation={false}>
                        <PendingApprovalPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin */}
                  <Route
                    path={ROUTES.ADMIN.path}
                    element={
                      <ProtectedRoute requireLocation={false}>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes */}
                  <Route
                    path={ROUTES.DASHBOARD.path}
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.SHOPPING_LIST.path}
                    element={
                      <ProtectedRoute>
                        <ShoppingListPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.SETTINGS.path}
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.STORAGE.path}
                    element={
                      <ProtectedRoute>
                        <StoragePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.RECIPES.path}
                    element={
                      <ProtectedRoute>
                        <RecipesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.SETTINGS_ACCOUNT.path}
                    element={
                      <ProtectedRoute>
                        <MyAccountPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.SETTINGS_APPLICATIONS.path}
                    element={
                      <ProtectedRoute>
                        <MyApplicationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.SETTINGS_APP_SETTINGS.path}
                    element={
                      <ProtectedRoute>
                        <AppSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.SETTINGS_ABOUT.path}
                    element={
                      <ProtectedRoute>
                        <AboutSandomLagerPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </SelectedRecipesProvider>
          </UserProvider>
        </AuthErrorProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}