import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    // 1. Check if the user is logged in
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
        // Not logged in? Kick them to the login page
        return <Navigate to="/login" replace />;
    }

    try {
        // 2. Check what role they have
        const user = JSON.parse(userString);
        
        // 3. If this route requires specific roles, check if the user has permission
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            
            // If they don't have permission, send them to the page they *are* allowed to see
            if (user.role === 'barista') {
                return <Navigate to="/kitchen-display" replace />;
            } else {
                return <Navigate to="/dashboard" replace />;
            }
        }

        // 4. They are logged in AND have the right role. Let them see the page!
        return <Outlet />;
        
    } catch (error) {
        // If the localStorage data is corrupted, force them to log in again
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;