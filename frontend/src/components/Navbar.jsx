// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase'; // Import Firebase Auth instance
import { signOut } from 'firebase/auth'; // Import Firebase signOut function
import { toast } from 'react-toastify'; // For user notifications
import { useAuthStatus } from '../hooks/useAuthStatus'; // Custom hook providing Firebase user
import './comp_styles/Navbar.css'; // Your existing styles
import { FaUserAstronaut } from 'react-icons/fa'; // Astronaut icon

// Define the base URL for your backend API for profiles
const BACKEND_API_BASE_URL = 'http://localhost:5000/api/profiles'; // Ensure this matches your backend port

const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false); // State for mobile menu open/close
    const [scrolled, setScrolled] = useState(false); // State for scroll effect on navbar
    const [profileOpen, setProfileOpen] = useState(false); // State for profile dropdown open/close
    const [userXp, setUserXp] = useState(0); // State to store user's XP fetched from backend
    const [displayName, setDisplayName] = useState('Explorer'); // State for user's display name
    const navigate = useNavigate(); // Hook for programmatic navigation
    const { loggedIn, checkingStatus, user } = useAuthStatus(); // Get Firebase loggedIn status, checking status, and Firebase User object

    // Effect for scroll handling: adds/removes 'scrolled' class based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll); // Cleanup on unmount
    }, []);

    // Effect for fetching user profile data (XP, full name) from MongoDB Atlas via Express Backend
    // This effect runs whenever the Firebase 'loggedIn' status or the 'user' object changes.
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (loggedIn && user) {
                const firebaseUid = user.uid; // Get the Firebase User ID (UID)

                try {
                    // Make a GET request to your backend's profile endpoint
                    // The backend will then fetch this from MongoDB Atlas
                    const response = await fetch(`${BACKEND_API_BASE_URL}/${firebaseUid}`);
                    const profileData = await response.json(); // Parse the JSON response

                    if (!response.ok) {
                        // If backend response indicates an error (e.g., 404, 500)
                        console.error("Error fetching user profile from backend:", profileData.error);
                        toast.error("Failed to load user profile data.");
                        setUserXp(0); // Reset XP on error
                        // Fallback display name from Firebase auth data if DB data fails
                        setDisplayName(user.displayName || user.email?.split('@')[0] || 'Explorer');
                    } else {
                        // Profile data successfully fetched from MongoDB Atlas
                        setUserXp(profileData.xp || 0); // Set XP from the fetched data
                        // Prioritize full_name from DB, fallback to Firebase displayName, then email part
                        setDisplayName(profileData.full_name || user.displayName || user.email?.split('@')[0] || 'Explorer');
                    }
                } catch (err) {
                    // Handle network or unexpected errors during the fetch
                    console.error("Unexpected error in backend profile fetch:", err);
                    toast.error("An unexpected error occurred while loading profile.");
                    setUserXp(0); // Reset XP on error
                    setDisplayName(user.displayName || user.email?.split('@')[0] || 'Explorer');
                }
            } else {
                // If user is logged out, reset XP and display name
                setUserXp(0);
                setDisplayName('Explorer');
            }
        };

        fetchUserProfile(); // Call the fetch function when dependencies change

    }, [loggedIn, user]); // Dependencies: loggedIn status and Firebase user object

    // Function to scroll to specific sections on the Home page
 const scrollToSection = (id) => {
    setIsOpen(false);

    if (window.location.pathname !== '/') {
        navigate('/', {
            state: { scrollTo: id },
            replace: true
        });
        return;
    }

    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

    const toggleMenu = () => setIsOpen(!isOpen); // Toggle mobile menu
    const toggleProfile = () => setProfileOpen(!profileOpen); // Toggle profile dropdown

    // Function to handle user logout via Firebase
    const handleLogout = async () => {
        try {
            await signOut(auth); // Firebase signOut
            toast.success("You have been successfully logged out!");
            setProfileOpen(false); // Close profile dropdown
            navigate('/login'); // Redirect to login page
        } catch (error) {
            console.error("Error during Firebase logout:", error);
            toast.error(`Logout failed: ${error.message}`);
        }
    };

    // Show loading state for Navbar while authentication status is being checked
    if (checkingStatus) {
        return (
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    <div className="navbar-logo">
                        <span className="brand-name">Loading...</span>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                        </svg>
                    </div>
                    <span className="brand-name">The Outside</span>
                </div>

                <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
                    <ul>
                        <li><Link onClick={() => scrollToSection('hero-section')} to="/">Home</Link></li>
                        {loggedIn ? (
                            <>
                                <li className="dropdown">
                                    <a href="#explore-dropdown">Explore <span className="dropdown-arrow">▼</span></a>
                                    <ul className="dropdown-menu">
                                        <li><Link to="/solarSystem" onClick={() => setIsOpen(false)}>Solar System</Link></li>
                                        <li><Link to="/ISSTracking" onClick={() => setIsOpen(false)}>ISS Tracker</Link></li>
                                        <li><Link to="/apod" onClick={() => setIsOpen(false)}>Astronomy Picture of The Day</Link></li>
                                    </ul>
                                </li>
                                <li className="dropdown">
                                    <a href="#learn-dropdown">Learn <span className="dropdown-arrow">▼</span></a>
                                    <ul className="dropdown-menu">
                                        <li><Link to="/spacefacts" onClick={() => setIsOpen(false)}>AI Facts</Link></li>
                                        <li><Link to="/spacequiz" onClick={() => setIsOpen(false)}>AI Quiz</Link></li>
                                        <li><Link to="/askdoubt" onClick={() => setIsOpen(false)}>AI Doubt Solving</Link></li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <>
                                {/* Show these links only on the home page if not logged in */}
                                {window.location.pathname === '/' && (
                                    <>
                                        <li><Link onClick={() => scrollToSection('features-section')}>Features</Link></li>
                                        <li><Link onClick={() => scrollToSection('about-section')}>About</Link></li>
                                    </>
                                )}
                            </>
                        )}
                    </ul>
                </div>

                <div className="navbar-cta">
                    {loggedIn ? (
                        <div className="profile-dropdown">
                            <button className="profile-button" onClick={toggleProfile}>
                                <FaUserAstronaut className="astronaut-icon" />
                            </button>
                            {profileOpen && (
                                <div className="profile-menu">
                                    <div className="profile-header">
                                        <FaUserAstronaut className="profile-icon" />
                                        <span>Astronaut {displayName}</span> {/* Display dynamic display name */}
                                    </div>
                                    <div className="profile-item">
                                        <span className="profile-label">XP:</span>
                                        <span className="profile-value">{userXp}</span> {/* Display dynamic XP */}
                                    </div>
                                    <Link to="/quiz-history" className="profile-item" onClick={() => setProfileOpen(false)}>
                                        Quiz History
                                    </Link>
                                    <button className="profile-item logout" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="cta-button" onClick={() => navigate('/login')}>
                            Sign Up / Login
                        </button>
                    )}
                </div>

                <div className="mobile-menu-toggle" onClick={toggleMenu}>
                    <div className={`hamburger ${isOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
