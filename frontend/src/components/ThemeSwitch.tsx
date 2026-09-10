import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeSwitchProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  id?: string;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  theme,
  onToggleTheme,
  id = 'uiverse-theme-switch',
}) => {
  return (
    <div
      className="inline-flex items-center gap-1.5 select-none"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <Sun
        className={`w-3.5 h-3.5 transition-colors ${
          theme === 'dark' ? 'text-[#DAC0A3]/50' : 'text-[#102C57]'
        }`}
      />
      <div className="relative inline-flex items-center">
        <input
          id={id}
          type="checkbox"
          checked={theme === 'dark'}
          onChange={onToggleTheme}
          className="uiverse-check"
          aria-label="Toggle light and dark theme"
        />
        <label className="uiverse-switch" htmlFor={id}>
          <svg viewBox="0 0 212.4992 84.4688" overflow="visible">
            <path
              pathLength="360"
              fill="none"
              stroke="currentColor"
              d="M 42.2496 0 A 42.24 42.24 90 0 0 0 42.2496 A 42.24 42.24 90 0 0 42.2496 84.4688 A 42.24 42.24 90 0 0 84.4992 42.2496 A 42.24 42.24 90 0 0 42.2496 0 A 42.24 42.24 90 0 0 0 42.2496 A 42.24 42.24 90 0 0 42.2496 84.4688 L 170.2496 84.4688 A 42.24 42.24 90 0 0 212.4992 42.2496 A 42.24 42.24 90 0 0 170.2496 0 A 42.24 42.24 90 0 0 128 42.2496 A 42.24 42.24 90 0 0 170.2496 84.4688 A 42.24 42.24 90 0 0 212.4992 42.2496 A 42.24 42.24 90 0 0 170.2496 0 L 42.2496 0"
            />
          </svg>
        </label>
      </div>
      <Moon
        className={`w-3.5 h-3.5 transition-colors ${
          theme === 'dark' ? 'text-[#FEFAF6]' : 'text-[#102C57]/40'
        }`}
      />
    </div>
  );
};
