/*
    * LoginPage.tsx
    * A login page component that provides options for users to log in or register using Auth0, 
    * featuring a welcoming title and theme toggle button.
    * Author: Emil Berglund
*/

import { LogIn, UserPlus } from "lucide-react";
import OnBoardingTitle from "../components/onBoarding/OnBoardingTitle";
import ToggleThemeButton from "../components/ToggleThemeButton";
import { AUTH0_AUDIENCE } from "../config/auth";

import { useAuth0 } from "@auth0/auth0-react";

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  // Handle login
  const handleLogin = () => {
    loginWithRedirect();
  };

  // Handle register (signup)
  const handleRegister = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        audience: AUTH0_AUDIENCE,
      },
    });
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 py-10 transition-colors"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <ToggleThemeButton />

      <div
        className="w-full max-w-md rounded-2xl shadow-md transition-colors relative overflow-hidden"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="relative p-8">
          <OnBoardingTitle description="Velkommen! Velg et alternativ for å komme i gang" />

          {/* Auth Buttons */}
          <div className="mt-8 space-y-4">
            {/* Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full h-14 rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-colors hover:opacity-95 cursor-pointer"
              style={{
                backgroundImage: 'linear-gradient(180deg, var(--color-primary-gradient-from), var(--color-primary-gradient-to))',
                color: 'var(--color-on-primary)',
              }}
            >
              <LogIn size={20} />
              Logg inn
            </button>

            {/* Register Button */}
            <button
              type="button"
              onClick={handleRegister}
              className="w-full h-14 rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-colors hover:opacity-90 cursor-pointer"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <UserPlus size={20} />
              Opprett ny konto
            </button>
          </div>

          <p 
            className="mt-6 text-xs text-center"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Sikker autentisering levert av Auth0
          </p>
        </div>
      </div>
    </section>
  );
}
