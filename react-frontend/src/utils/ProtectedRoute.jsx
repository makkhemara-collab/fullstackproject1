import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userString);
        
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            if (user.role === 'barista') {
                return <Navigate to="/kitchen" replace />; // Updated to match your route
            } else {
                return <Navigate to="/dashboard" replace />;
            }
        }

        return <Outlet />;
        
    } catch (error) {
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;