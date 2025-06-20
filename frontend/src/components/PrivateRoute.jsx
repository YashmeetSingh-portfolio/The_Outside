// src/components/PrivateRoute.jsx
// This component protects routes based on Firebase Authentication status.

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; // Custom hook providing Firebase user info

function PrivateRoute({ children }) {
    const { loggedIn, checkingStatus, user } = useAuthStatus(); // Get Firebase authentication status and user object

    // Display a loading message while authentication status is being checked
    if (checkingStatus) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0a20', color: 'white', fontSize: '1.5rem' }}>Verifying authentication...</div>;
    }

    // Check if the user is logged in via Firebase AND if their email is verified.
    // For Firebase email/password accounts, `emailVerified` is crucial.
    // For Google/Social logins with Firebase Auth, `emailVerified` is typically true by default.
    const isEmailVerified = user ? user.emailVerified : false;

    // If logged in and email verified, render the children (protected content), otherwise redirect to login.
    return loggedIn && isEmailVerified ? (children ? children : <Outlet />) : <Navigate to="/login" />;
}

export default PrivateRoute;
