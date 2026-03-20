import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import {
    FaHome, FaUsers, FaCheckCircle, FaCalendarAlt, FaChartBar,
    FaFileAlt, FaCog, FaPlusCircle, FaList, FaTicketAlt,
    FaBook, FaUser, FaBell, FaCommentAlt, FaSignOutAlt, FaSun, FaMoon
} from 'react-icons/fa';

const DashboardLayout = ({ role, children }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { theme, toggleTheme } = useContext(ThemeContext);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true); // Always open on desktop
            } else {
                setIsSidebarOpen(false); // Closed by default on mobile
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getNavItems = () => {
        const userRole = localStorage.getItem('userRole') || role; // Prioritize localStorage, fallback to prop

        switch (userRole) {
            case 'admin':
                return [
                    { path: '/dashboard/admin', label: 'Dashboard', icon: <FaHome /> },
                    { path: '/manage-users', label: 'Manage Users', icon: <FaUsers /> },
                    { path: '/approve-events', label: 'Approve Events', icon: <FaCheckCircle /> },
                    { path: '/dashboard/admin/events', label: 'All Events', icon: <FaCalendarAlt /> },
                    { path: '/analytics', label: 'Analytics', icon: <FaChartBar /> },
                    { path: '/dashboard/admin/reports', label: 'Reports', icon: <FaFileAlt /> },
                    { path: '/dashboard/admin/settings', label: 'Settings', icon: <FaCog /> },
                ];
            case 'organizer':
                return [
                    { path: '/dashboard/organizer', label: 'Dashboard', icon: <FaHome /> },
                    { path: '/create-event', label: 'Create Event', icon: <FaPlusCircle /> },
                    { path: '/dashboard/organizer/my-events', label: 'My Events', icon: <FaList /> },
                    { path: '/registrations', label: 'Registrations', icon: <FaTicketAlt /> },
                    { path: '/analytics', label: 'Analytics', icon: <FaChartBar /> },
                    { path: '/dashboard/organizer/profile', label: 'Profile', icon: <FaUser /> },
                ];
            case 'attendee':
                return [
                    { path: '/dashboard/attendee', label: 'Dashboard', icon: <FaHome /> },
                    { path: '/events', label: 'Browse Events', icon: <FaCalendarAlt /> },
                    { path: '/my-ticket', label: 'My Tickets', icon: <FaTicketAlt /> },
                    { path: '/dashboard/attendee/notifications', label: 'Notifications', icon: <FaBell /> },
                    { path: '/feedback', label: 'Feedback', icon: <FaCommentAlt /> },
                    { path: '/dashboard/attendee/profile', label: 'Profile', icon: <FaUser /> },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', position: 'relative' }}>

            {/* Mobile Toggle Button */}
            {isMobile && (
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 1001,
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '45px',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'var(--transition)'
                    }}
                >
                    {isSidebarOpen ? '×' : '☰'}
                </button>
            )}

            {/* Sidebar */}
            <div style={{
                width: '280px',
                background: 'var(--sidebar-bg)',
                color: 'var(--text)',
                padding: '2rem 1.5rem',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto',
                left: isSidebarOpen ? '0' : '-280px',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1000,
                boxShadow: isSidebarOpen ? 'var(--shadow-lg)' : 'none',
                borderRight: 'var(--glass-border)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{
                    color: 'var(--dark)',
                    marginBottom: '2.5rem',
                    fontSize: '1.5rem',
                    textAlign: isMobile ? 'center' : 'left',
                    paddingTop: isMobile ? '2.5rem' : '0',
                    fontWeight: '800',
                    letterSpacing: '-0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <img src="/logo.png" alt="EK" style={{ width: '55px', height: '55px', objectFit: 'contain' }} /> EventKonnect
                </h2>
                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => isMobile && setIsSidebarOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '14px 16px',
                                    color: isActive ? 'white' : 'var(--text)',
                                    opacity: isActive ? 1 : 0.8,
                                    textDecoration: 'none',
                                    borderRadius: '12px',
                                    marginBottom: '8px',
                                    transition: 'all 0.3s ease',
                                    background: isActive ? 'var(--primary)' : 'transparent',
                                    fontWeight: isActive ? '600' : '500',
                                    boxShadow: isActive ? 'var(--shadow-md)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.opacity = '0.8';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <span style={{ fontSize: '1.2rem', display: 'flex' }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#ef4444',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            fontWeight: '600',
                            background: 'rgba(239, 68, 68, 0.1)'
                        }}
                        onClick={() => {
                            localStorage.removeItem('isAuthenticated');
                            if (isMobile) setIsSidebarOpen(false);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        <span style={{ fontSize: '1.2rem', display: 'flex' }}><FaSignOutAlt /></span>
                        Logout
                    </Link>
                </div>

                {/* Theme Toggle Switch */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            border: 'none',
                            color: 'var(--text)',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px 15px',
                            borderRadius: '20px',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            gap: '10px'
                        }}
                    >
                        {theme === 'light' ? (
                            <><FaMoon /> <span style={{ fontSize: '1rem', fontWeight: '500' }}>Dark Mode</span></>
                        ) : (
                            <><FaSun style={{ color: '#FCD34D' }} /> <span style={{ fontSize: '1rem', fontWeight: '500' }}>Light Mode</span></>
                        )}
                    </button>
                </div>
            </div>

            {/* Overlay for Mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 999,
                        transition: 'opacity 0.3s ease'
                    }}
                />
            )}

            {/* Main Content */}
            <div style={{
                marginLeft: isMobile ? '0' : '280px',
                flexGrow: 1,
                padding: '2rem',
                paddingTop: isMobile ? '5rem' : '2rem',
                width: isMobile ? '100%' : 'calc(100% - 280px)',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease'
            }}>
                <div key={location.pathname} className="animate-fade-in" style={{ animationDuration: '0.4s' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
