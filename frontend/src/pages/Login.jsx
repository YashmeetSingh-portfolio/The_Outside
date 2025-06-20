// src/pages/Login.jsx
// This file uses Firebase Authentication ONLY for login.
// It does NOT interact with MongoDB Atlas or your backend for data storage here.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword, // For email/password login
    GoogleAuthProvider, // For Google sign-in
    signInWithPopup, // For Google sign-in popup
    sendEmailVerification // For resending verification email (optional)
} from 'firebase/auth';
import { auth } from '../config/firebase'; // Import Firebase Auth instance
import { toast } from 'react-toastify'; // For user notifications
import '../styles/Auth.css'; // Your existing styles

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Unified loading state
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    // --- Firebase Google Sign-In Function ---
    const signInWithGoogle = async () => {
        setLoading(true); // Start loading state
        try {
            const provider = new GoogleAuthProvider(); // Create a new Google Auth provider
            await signInWithPopup(auth, provider); // Trigger the Google sign-in popup

            toast.success("Successfully logged in with Google (Firebase)!");
            navigate('/'); // Navigate to home after successful login
        } catch (error) {
            console.error("Error during Firebase Google Sign-In:", error.message);
            let errorMessage = "Google login failed.";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Google login window was closed.";
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = "Google login pop-up already open or in progress.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Network error. Please check your internet connection.";
            } else if (error.code === 'auth/unauthorized-domain') {
                 errorMessage = 'Google login failed due to unauthorized domain. Check Firebase Auth settings.';
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false); // End loading state
        }
    };

    // --- Firebase Email/Password Login Function ---
    const handleLogin = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setLoading(true); // Start loading state

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user; // Get the Firebase authenticated user object

            // Check if email is verified (essential for security and data integrity)
            if (!user.emailVerified) {
                toast.warn("Please verify your email address. A verification link has been sent to your inbox. You can login once verified.");
                // Optionally, you can offer to resend the verification email here:
                // await sendEmailVerification(user);
                setLoading(false);
                return; // Stop login process if email not verified
            }

            toast.success("Successfully logged in (Firebase Email/Password)!");
            navigate('/'); // Navigate to home after successful login

        } catch (error) {
            console.error("Error during Firebase login:", error.message);
            // Handle Firebase-specific errors for email/password login
            let errorMessage = "Login failed. Please check your credentials.";
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'Invalid email or password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address is not valid.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many login attempts. Please try again later.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Your account has been disabled.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage = 'Failed to log in. Please try again.';
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false); // End loading state
        }
    };

    return (
        <div className="auth-container">
            <div className="stars-background">
                <div className="stars"></div>
                <div className="stars2"></div>
                <div className="stars3"></div>
            </div>

            <div className="glass-card">
                {/* Back to Home Button */}
                <Link to="/" className="back-to-home-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                    </svg>
                     Home
                </Link>

                <h1 className="auth-title">Welcome Back to The Outside</h1>
                <p className="auth-subtitle">Log in to explore the universe</p>

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group password-group"> {/* Added a wrapper for password field */}
                        <input
                            type={showPassword ? "text" : "password"} // Toggle type
                            placeholder="Password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        {/* Password toggle button */}
                        <button
                            type="button" // Important: type="button" to prevent form submission
                            className="password-toggle-button"
                            onClick={togglePasswordVisibility}
                            disabled={loading}
                        >
                            {showPassword ? (
                                // Eye-slash icon (hide password)
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3 5.5-8 5.5a7 7 0 0 1-2.017-.387l-1.188 1.188A10 10 0 0 0 8 14.5c5.168 0 9.32-3.945 11.882-5.945L11.815 9.06zM2.31 3.058l1.79 1.79A9.96 9.96 0 0 0 0 8c2.817 4.9 6.838 6.475 9.47 6.475 1.054 0 2.05-.182 2.977-.5l.772.772c-.896.395-1.93.75-3.04.75C2.5 14.5-1 8 0 8s3-5.5 8-5.5a7 7 0 0 1 2.017.387L13.188.812A10 10 0 0 0 8 1.5C2.832 1.5-1.32 5.445-3.882 7.445z"/>
                                    <path d="M7 6c0 1.105.895 2 2 2 .053 0 .105-.002.158-.004L8.7 7.27a1.5 1.5 0 0 0-1.5-1.5L7 6zm3.935 5.727a2.5 2.5 0 0 0-3.146-3.146l-1.336 1.336a1 1 0 0 0-.258.113L6 10l.3-.3a.5.5 0 0 1 .6-.6l.7-.7a.5.5 0 0 1 .8.8l.5.5c.33.33.5.57.9.8ZM7 9.5a1.5 1.5 0 0 1-1.5-1.5V7a.5.5 0 0 1 1-1h1a.5.5 0 0 1 1 .5V8c0 .28-.14.68-.43.94l-.86.86zm-.788.788-1.788-1.788.113-.258a2.5 2.5 0 0 0-3.146-3.146L.812 3.188A10 10 0 0 1 8 1.5c.29 0 .58.01.86.04l.7-.7c-.28-.03-.57-.05-.86-.05C2.832 1.5-1.32 5.445-3.882 7.445z"/>
                                </svg>
                            ) : (
                                // Eye icon (show password)
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                </svg>
                            )}
                        </button>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Logging In...' : 'Login'}
                    </button>

                    <div className="auth-links">
                        <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                    </div>
                </form>

                <div className="social-login-separator">
                    <span>OR</span>
                </div>

                <button
                    className="google-login-button"
                    onClick={signInWithGoogle}
                    disabled={loading}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" />
                    Sign in with Google
                </button>

                <p className="auth-redirect">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
