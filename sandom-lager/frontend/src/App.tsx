import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { ProtectedRoute } from "./auth";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/Dashboard";
import ShoppingListPage from "./pages/ShoppingListPage";
import SettingsPage from "./pages/SettingsPage";
import StoragePage from "./pages/StoragePage";
import RecipesPage from "./pages/RecipesPage";
import MyAccountPage from "./pages/settings/MyAccountPage";
import MyApplicationsPage from "./pages/settings/MyApplicationsPage";
import AppSettingsPage from "./pages/settings/AppSettingsPage";

import AdminPage from "./pages/AdminPage";
import RequestAccessPage from "./pages/onboarding/RequestAccessPage"; // ← beholder din sti
import PendingApprovalPage from "./pages/onboarding/PendingApprovalPage"; // ← beholder din sti
import { ROUTES } from "./router/routes"; // ← beholder deres tillegg

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />
          
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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}