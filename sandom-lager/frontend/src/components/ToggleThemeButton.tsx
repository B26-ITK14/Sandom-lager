import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type ToggleThemeButtonProps = {
	className?: string;
	iconSize?: number;
};

export default function ToggleThemeButton({ className, iconSize = 18 }: ToggleThemeButtonProps) {
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
			}}
		>
			{theme === 'light' ? <Moon size={iconSize} /> : <Sun size={iconSize} />}
		</button>
	);
}

