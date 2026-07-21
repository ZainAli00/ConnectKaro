import { useTheme } from '../../theme/useTheme';
import './ThemeToggle.css';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={['ck-theme-toggle', className].filter(Boolean).join(' ')}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
    >
      <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
    </button>
  );
}
