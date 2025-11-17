import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export const Navigation = () => {
    const location = useLocation();

    return (
        <nav className="nav">
            <div className="nav__container">
                <div className="nav__brand">
                    <span className="nav__logo">📋</span>
                    <span className="nav__title">Issue Tracker</span>
                </div>
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
            </div>
        </nav>
    );
};