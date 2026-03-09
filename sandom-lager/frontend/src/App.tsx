import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./auth/ProtectedRoute";

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
import RequestAccessPage from "./pages/RequestAccessPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />
          
           {/* Onboarding – krever innlogging, men ikke godkjent lokasjon */}
          <Route
            path="/request-access"
            element={
              <ProtectedRoute>
                <RequestAccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-approval"
            element={
              <ProtectedRoute>
                <PendingApprovalPage />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Protected route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/storage"
            element={
              <ProtectedRoute>
                <StoragePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <RecipesPage />
              </ProtectedRoute>
            }
          />  

          <Route
            path="/settings/account"
            element={
              <ProtectedRoute>
                <MyAccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/applications"
            element={
              <ProtectedRoute>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/app-settings"
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
    </ThemeProvider>
  );
}
