import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { theme, toggleTheme } = useContext(ThemeContext);

    useEffect(() => {
        const authStatus = localStorage.getItem('isAuthenticated');
        setIsAuthenticated(!!authStatus);

        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        handleScroll(); // Check immediately
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const isHome = location.pathname === '/';
    const navbarClass = `navbar ${isHome ? (scrolled ? 'navbar-solid' : 'navbar-transparent') : 'navbar-solid'}`;

    return (
        <nav className={navbarClass}>
            <div className="nav-container">
                <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="EventKonnect Icon" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                    EventKonnect
                </Link>

                <div className="menu-icon" onClick={toggleMenu}>
                    <span className={isOpen ? 'bar active' : 'bar'}></span>
                    <span className={isOpen ? 'bar active' : 'bar'}></span>
                    <span className={isOpen ? 'bar active' : 'bar'}></span>
                </div>

                <div className={isOpen ? "nav-menu active" : "nav-menu"}>
                    <ul className="nav-links">
                        <li className="nav-item">
                            <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>About</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>Contact</Link>
                        </li>
                    </ul>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: isHome && !scrolled && window.innerWidth > 768 ? 'white' : 'var(--dark)',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1rem',
                            transition: 'color 0.3s ease'
                        }}
                        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                    >
                        {theme === 'light' ? <FaMoon /> : <FaSun style={{ color: '#FCD34D' }} />}
                    </button>

                    {!isAuthenticated ? (
                        <div className="nav-auth">
                            <Link to="/login" className="btn btn-login" onClick={() => setIsOpen(false)}>Login</Link>
                            <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>Register</Link>
                        </div>
                    ) : (
                        <div className="nav-auth" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} onClick={() => setIsOpen(false)}>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${localStorage.getItem('userEmail') || 'User'}&background=6366F1&color=fff&rounded=true&bold=true`}
                                    alt="Profile"
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)', cursor: 'pointer' }}
                                />
                            </Link>
                            <Link to="/my-ticket" className="nav-link" onClick={() => setIsOpen(false)}>My Tickets</Link>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    localStorage.removeItem('isAuthenticated');
                                    localStorage.removeItem('userRole'); // Clear role too
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('userEmail');
                                    setIsAuthenticated(false);
                                    setIsOpen(false);
                                    window.location.href = '/'; // Hard reload/redirect to clear state
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
