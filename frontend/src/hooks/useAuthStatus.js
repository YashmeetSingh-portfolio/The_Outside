// src/hooks/useAuthStatus.js
// This hook is solely responsible for providing Firebase Authentication status.
// It listens to Firebase's onAuthStateChanged and returns the Firebase User object.

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth listener
import { auth } from '../config/firebase'; // Import Firebase Auth instance

export function useAuthStatus() {
    const [loggedIn, setLoggedIn] = useState(false); // True if a Firebase user is logged in
    const [checkingStatus, setCheckingStatus] = useState(true); // True while checking auth state
    const [user, setUser] = useState(null); // Stores the Firebase User object if logged in

    useEffect(() => {
        // Subscribe to Firebase Authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in via Firebase
                setLoggedIn(true);
                setUser(firebaseUser); // Set the Firebase User object
            } else {
                // User is signed out or no user is logged in
                setLoggedIn(false);
                setUser(null); // Clear user object
            }
            setCheckingStatus(false); // Authentication check is complete
        });

        // Cleanup function: unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // Return the current authentication status and user object
    return { loggedIn, checkingStatus, user };
}
