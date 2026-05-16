/*
    * appStability.ts
    * Custom React hook for determining the stability status of the application based on its version.
    * This hook analyzes the version string from package-lock.json to classify it as stable, rc, beta, alpha, or development.
    * It also provides a user-friendly label for the stability status and indicates whether the app is in production or not.
    * Author: Emil Berglund
 */

import packageLock from "../../../package-lock.json";

export type StabilityStatus =
    | "stable"
    | "rc"
    | "beta"
    | "alpha"
    | "development";

export interface AppStabilityInfo {
    status: StabilityStatus;
    version: string | null;
    isProduction: boolean;
    preReleaseTag?: string;
}

const determineStability = (version: string | undefined): AppStabilityInfo => {
    if (!version || version === "0.0.0") {
        return {
            status: "development",
            version: version || null,
            isProduction: false,
        };
    }

    // Check for pre-release/dev tags
    const versionLower = version.toLowerCase();

    if (versionLower.includes("-alpha") || versionLower.includes("alpha")) {
        return {
            status: "alpha",
            version,
            isProduction: false,
            preReleaseTag: "alpha",
        };
    }

    if (versionLower.includes("-beta") || versionLower.includes("beta")) {
        return {
            status: "beta",
            version,
            isProduction: false,
            preReleaseTag: "beta",
        };
    }

    if (
        versionLower.includes("-rc") ||
        versionLower.includes("rc") ||
        versionLower.includes("-candidate")
    ) {
        return {
            status: "rc",
            version,
            isProduction: false,
            preReleaseTag: "rc",
        };
    }

    // Check if major version is 0 (pre-1.0 release)
    const majorVersion = parseInt(version.split(".")[0], 10);
    if (majorVersion === 0) {
        return {
            status: "development",
            version,
            isProduction: false,
        };
    }

    // Otherwise, it's a stable release
    return {
        status: "stable",
        version,
        isProduction: true,
    };
};

export const stabilityLabels: Record<string, string> = {
    stable: 'Stabil',
    rc: 'Release Candidate',
    beta: 'Beta',
    alpha: 'Alpha',
    development: 'Under utvikling',
};

/**
 * Determines the stability of the current application version
 * @returns AppStabilityInfo with stability status, version, and production flag
 */
export function useAppStability(): AppStabilityInfo {
    return determineStability(packageLock?.version);
}
