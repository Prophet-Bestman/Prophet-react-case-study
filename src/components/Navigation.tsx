import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import './Navigation.css';

export const Navigation = () => {
    const location = useLocation();
    const { mode, toggleTheme } = useTheme();

    const getThemeIcon = () => {
        if (mode === 'auto') return '🌓';
        if (mode === 'dark') return '🌙';
        return '☀️';
    };

    const getThemeLabel = () => {
        if (mode === 'auto') return 'Auto';
        if (mode === 'dark') return 'Dark';
        return 'Light';
    };

    return (
        <nav className="nav">
            <div className="nav__container">
                <div className="nav__brand">
                    <span className="nav__logo">📋</span>
                    <span className="nav__title">Issue Tracker</span>
                </div>
                <div className="nav__actions">
                    <div className="nav__links">
                        <Link
                            to="/board"
                            className={`nav__link ${location.pathname === '/board' || location.pathname === '/' ? 'nav__link--active' : ''}`}
                        >
                            Board
                        </Link>
                        <Link
                            to="/settings"
                            className={`nav__link ${location.pathname === '/settings' ? 'nav__link--active' : ''}`}
                        >
                            Settings
                        </Link>
                    </div>
                    <button
                        className="nav__theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        title={`Theme: ${getThemeLabel()}`}
                    >
                        <span className="nav__theme-icon">{getThemeIcon()}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};