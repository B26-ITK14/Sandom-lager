/*
    * appVersion.ts
    * Custom React hook for retrieving the application's version information from package-lock.json.
    * This hook provides a simple interface to access the app version and determine if it's in development mode.
	* Author: Emil Berglund
*/


import { version as packageLockVersion } from '../../../package-lock.json';

export interface AppVersionInfo {
	raw: string | null;
	display: string;
}

export function useAppVersion(): AppVersionInfo {
		const raw = packageLockVersion ?? null;

		return {
			raw,
			display: raw ?? 'Ukjent'
		};
}

