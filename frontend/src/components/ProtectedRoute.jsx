import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');

    // 1. Check Authentication
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Check Role (if specific roles are required)
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to their appropriate dashboard if they try to access a wrong one
        if (userRole === 'admin') return <Navigate to="/dashboard/admin" replace />;
        if (userRole === 'organizer') return <Navigate to="/dashboard/organizer" replace />;
        if (userRole === 'attendee') return <Navigate to="/dashboard/attendee" replace />;
        return <Navigate to="/" replace />; // Fallback
    }

    // 3. Authorized
    return <Outlet />;
};

export default ProtectedRoute;
