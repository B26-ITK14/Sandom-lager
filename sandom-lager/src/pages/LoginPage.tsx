import { useState } from "react";
import { Smartphone } from "lucide-react";

import OnBoardingTitle from "../components/onBoarding/OnBoardingTitle";
import OnBoardingButton from "../components/onBoarding/OnBoardingButton";
import ToggleThemeButton from "../components/ToggleThemeButton";

import { useAuth0 } from "@auth0/auth0-react";

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Auth0 login function
  const { loginWithRedirect } = useAuth0();

  // Handle login/register button click
  const handleAuth0Login = () => {
    if (activeTab === "register") {
      loginWithRedirect({
        authorizationParams: {
          screen_hint: "signup",
        },
      });
    } else {
      loginWithRedirect();
    }
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
          <OnBoardingTitle description="Lag en konto eller logg inn for å komme i gang" />

          {/* Tabs */}
          <div
            className="mt-6 grid grid-cols-2 rounded-xl p-1"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-border) 35%, transparent)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className="h-10 rounded-lg text-sm font-semibold transition-colors"
              style={
                activeTab === "login"
                  ? {
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "var(--color-text-secondary)",
                    }
              }
            >
              Logg inn
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className="h-10 rounded-lg text-sm font-semibold transition-colors"
              style={
                activeTab === "register"
                  ? {
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "var(--color-text-secondary)",
                    }
              }
            >
              Registrer deg
            </button>
          </div>

          {/* Auth0 Login Button */}
          <div className="mt-8 space-y-4">
            <OnBoardingButton
              type="button"
              text={activeTab === "register" ? "Registrer deg" : "Logg inn"}
              variant="primary"
              className="h-12 rounded-xl font-semibold w-full"
              onClick={handleAuth0Login}
            />

            {/* Remember Me */}
            <label
              className="inline-flex items-center gap-2 select-none text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Husk meg
            </label>
          </div>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-border) 70%, transparent)",
              }}
            />
            <span
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Eller
            </span>
            <div
              className="h-px flex-1"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-border) 70%, transparent)",
              }}
            />
          </div>

          {/* Alternative Sign-in Placeholder */}
          <button
            type="button"
            className="mt-4 w-full h-12 rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--color-surface)",
              border:
                "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)",
              color: "var(--color-text-primary)",
            }}
          >
            <Smartphone size={18} />
            Logg inn med mobil
          </button>
        </div>
      </div>
    </section>
  );
}
