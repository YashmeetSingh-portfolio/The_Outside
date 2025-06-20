// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    createUserWithEmailAndPassword,
    updateProfile, // For setting displayName in Firebase Auth
    sendEmailVerification // For Firebase email verification
} from 'firebase/auth';
import { auth } from '../config/firebase'; // Import Firebase Auth instance
import { toast } from 'react-toastify'; // For user notifications
import '../styles/Auth.css'; // Your existing styles

// Define the base URL for your backend API for profiles
// Ensure this matches the port your backend server runs on (e.g., 5000)
const BACKEND_API_BASE_URL = 'http://localhost:5000/api/profiles';

function Signup() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false); // Unified loading state
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

    // Functions to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prevState => !prevState);
    };

    const handleSignup = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setLoading(true); // Start loading state

        // Basic password confirmation
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            // 1. Firebase: Create User Account (Authentication step)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user; // Get the authenticated Firebase user object

            // 2. Firebase: Update User Profile (e.g., set displayName in Firebase Auth)
            await updateProfile(firebaseUser, {
                displayName: fullName, // Set the display name in Firebase Auth profile
            });

            // 3. Firebase: Send Email Verification Link
            await sendEmailVerification(firebaseUser);
            toast.success("Account created successfully! Please check your email to verify your address.");

            // 4. Backend Express API: Store Additional User Data in MongoDB Atlas
            // Send the Firebase User ID (UID) to your backend to link the profile
            const response = await fetch(BACKEND_API_BASE_URL, {
                method: 'POST', // Use POST to create a new profile
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firebaseUid: firebaseUser.uid, // This is the unique ID from Firebase Auth
                    fullName: fullName,
                    email: email,
                    // XP will be initialized to 0 by the backend
                }),
            });

            const data = await response.json(); // Parse the JSON response from your backend

            if (!response.ok) {
                // If backend response is not OK (e.g., 400, 500 status)
                console.error("Error creating user profile in MongoDB Atlas via backend:", data.error);
                toast.error(`Account created, but failed to save user profile: ${data.error}. Please contact support.`);
                // Note: The Firebase account IS created, even if profile saving fails.
                // You might log this server-side for admin follow-up.
            } else {
                console.log("User profile saved in MongoDB Atlas:", data);
                toast.success("User profile data saved!");
            }

            navigate('/login'); // Redirect to login page after successful signup and data storage

        } catch (error) {
            console.error("Error during signup or MongoDB Atlas data storage:", error.message);
            // Handle Firebase-specific errors and provide user-friendly messages
            let errorMessage = "Signup failed. Please try again.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already in use.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address is not valid.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. It should be at least 6 characters.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage = `Signup failed: ${error.message}`;
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

                <h1 className="auth-title">Join The Outside</h1>
                <p className="auth-subtitle">Create your account and start exploring</p>

                <form className="auth-form" onSubmit={handleSignup}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="auth-input"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

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

                    <div className="form-group password-group"> {/* Added wrapper */}
                        <input
                            type={showPassword ? "text" : "password"} // Toggle type
                            placeholder="Password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                         <button
                            type="button"
                            className="password-toggle-button"
                            onClick={togglePasswordVisibility}
                            disabled={loading}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3 5.5-8 5.5a7 7 0 0 1-2.017-.387l-1.188 1.188A10 10 0 0 0 8 14.5c5.168 0 9.32-3.945 11.882-5.945L11.815 9.06zM2.31 3.058l1.79 1.79A9.96 9.96 0 0 0 0 8c2.817 4.9 6.838 6.475 9.47 6.475 1.054 0 2.05-.182 2.977-.5l.772.772c-.896.395-1.93.75-3.04.75C2.5 14.5-1 8 0 8s3-5.5 8-5.5a7 7 0 0 1 2.017.387L13.188.812A10 10 0 0 0 8 1.5C2.832 1.5-1.32 5.445-3.882 7.445z"/>
                                    <path d="M7 6c0 1.105.895 2 2 2 .053 0 .105-.002.158-.004L8.7 7.27a1.5 1.5 0 0 0-1.5-1.5L7 6zm3.935 5.727a2.5 2.5 0 0 0-3.146-3.146l-1.336 1.336a1 1 0 0 0-.258.113L6 10l.3-.3a.5.5 0 0 1 .6-.6l.7-.7a.5.5 0 0 1 .8.8l.5.5c.33.33.5.57.9.8ZM7 9.5a1.5 1.5 0 0 1-1.5-1.5V7a.5.5 0 0 1 1-1h1a.5.5 0 0 1 1 .5V8c0 .28-.14.68-.43.94l-.86.86zm-.788.788-1.788-1.788.113-.258a2.5 2.5 0 0 0-3.146-3.146L.812 3.188A10 10 0 0 1 8 1.5c.29 0 .58.01.86.04l.7-.7c-.28-.03-.57-.05-.86-.05C2.832 1.5-1.32 5.445-3.882 7.445z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="form-group password-group"> {/* Added wrapper */}
                        <input
                            type={showConfirmPassword ? "text" : "password"} // Toggle type
                            placeholder="Confirm Password"
                            className="auth-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="password-toggle-button"
                            onClick={toggleConfirmPasswordVisibility}
                            disabled={loading}
                        >
                            {showConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3 5.5-8 5.5a7 7 0 0 1-2.017-.387l-1.188 1.188A10 10 0 0 0 8 14.5c5.168 0 9.32-3.945 11.882-5.945L11.815 9.06zM2.31 3.058l1.79 1.79A9.96 9.96 0 0 0 0 8c2.817 4.9 6.838 6.475 9.47 6.475 1.054 0 2.05-.182 2.977-.5l.772.772c-.896.395-1.93.75-3.04.75C2.5 14.5-1 8 0 8s3-5.5 8-5.5a7 7 0 0 1 2.017.387L13.188.812A10 10 0 0 0 8 1.5C2.832 1.5-1.32 5.445-3.882 7.445z"/>
                                    <path d="M7 6c0 1.105.895 2 2 2 .053 0 .105-.002.158-.004L8.7 7.27a1.5 1.5 0 0 0-1.5-1.5L7 6zm3.935 5.727a2.5 2.5 0 0 0-3.146-3.146l-1.336 1.336a1 1 0 0 0-.258.113L6 10l.3-.3a.5.5 0 0 1 .6-.6l.7-.7a.5.5 0 0 1 .8.8l.5.5c.33.33.5.57.9.8ZM7 9.5a1.5 1.5 0 0 1-1.5-1.5V7a.5.5 0 0 1 1-1h1a.5.5 0 0 1 1 .5V8c0 .28-.14.68-.43.94l-.86.86zm-.788.788-1.788-1.788.113-.258a2.5 2.5 0 0 0-3.146-3.146L.812 3.188A10 10 0 0 1 8 1.5c.29 0 .58.01.86.04l.7-.7c-.28-.03-.57-.05-.86-.05C2.832 1.5-1.32 5.445-3.882 7.445z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                </svg>
                            )}
                        </button>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-redirect">
                    Already have an account? <Link to="/login" className="auth-link">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
