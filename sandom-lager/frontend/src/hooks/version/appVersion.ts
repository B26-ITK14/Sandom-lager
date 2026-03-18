import { useMemo } from 'react';
import { version as packageLockVersion } from '../../../package-lock.json';

export interface AppVersionInfo {
	raw: string | null;
	display: string;
	isDevelopment: boolean;
}

export function useAppVersion(): AppVersionInfo {
	return useMemo(() => {
		const raw = packageLockVersion ?? null;
		const isDevelopment = raw === null || raw === '0.0.0';

		return {
			raw,
			display: isDevelopment ? 'Under utvikling' : raw,
			isDevelopment,
		};
	}, []);
}

