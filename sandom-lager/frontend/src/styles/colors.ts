export type ColorMode = "light" | "dark";

export type ColorTokens = {
    headerTextPrimary: string;
    textPrimary: string;
    textSecondary: string;
    background: string;
    surface: string;
    secondarySurface: string;
    border: string;
    primary: string;
    primaryHover: string;
    primaryGradientFrom: string;
    primaryGradientTo: string;
    onPrimary: string;
    danger: string;
    onDanger: string;
};

export const COLORS: Record<ColorMode, ColorTokens> = {
    light: {
        headerTextPrimary: "#343C6A",
        textPrimary: "#111827",
        textSecondary: "#6C7278",
        background: "#F3F4F6",
        surface: "#FFFFFF",
        secondarySurface: "#F1F3F6",
        border: "#D1D5DB",
        primary: "#5965A9",
        primaryHover: "#4B569B",
        primaryGradientFrom: "#7C86C8",
        primaryGradientTo: "#5965A9",
        onPrimary: "#FFFFFF",
        danger: "#DC2626",
        onDanger: "#FFFFFF",
    },
    dark: {
        headerTextPrimary: "#5965A9",
        textPrimary: "#F9FAFB",
        textSecondary: "#D1D5DB",
        background: "#111827",
        surface: "#1F2937",
        secondarySurface: "#374151",
        border: "#374151",
        primary: "#9AA4FF",
        primaryHover: "#7F8BFF",
        primaryGradientFrom: "#7F8BFF",
        primaryGradientTo: "#9AA4FF",
        onPrimary: "#0B1020",
        danger: "#F87171",
        onDanger: "#0B1020",
    },
};
