/*
	* ToggleThemeButton.tsx
	* A button component that allows users to toggle between light and dark themes, displaying an appropriate icon based on the current theme.
	* Author: Emil Berglund
*/

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type ToggleThemeButtonProps = {
	darkText?: string;
	lightText?: string;
	text?: string;
	className?: string;
	iconSize?: number;
	style? : React.CSSProperties;
};

export default function ToggleThemeButton({ darkText, lightText, text, className, iconSize = 18, style }: ToggleThemeButtonProps) {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className={className ?? 'absolute top-4 right-4 p-2 rounded-md transition-colors cursor-pointer'}
			aria-label="Toggle theme"
			style={{
				backgroundColor: 'var(--color-surface)',
				color: 'var(--color-text-primary)',
				border: '1px solid var(--color-border)',
				...style
			}}
		>
			{theme === 'light' ? <Moon size={iconSize} /> : <Sun size={iconSize} />}
			{text || (theme === 'light' ? darkText : lightText)}
		</button>
	);
}

