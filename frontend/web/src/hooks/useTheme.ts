import { useState, useEffect, useCallback } from "react";
import { settingsApi } from "../services/settingsApi";

const THEME_KEY = "mist-theme";
const LEGACY_THEME_KEY = "clientfinder-theme";
type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, theme);
}

function getStoredTheme(): Theme {
    try {
        const stored = localStorage.getItem(THEME_KEY) ?? localStorage.getItem(LEGACY_THEME_KEY);
        return stored === "light" ? "light" : "dark";
    } catch {
        return "dark";
    }
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getStoredTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);

        // Sync with backend — non-blocking, failure is acceptable
        settingsApi.update(newTheme).catch(() => {
            // Theme persists locally even if backend sync fails
        });
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [theme, setTheme]);

    return { theme, setTheme, toggleTheme };
}
