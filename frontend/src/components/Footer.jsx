import React from 'react';
import './comp_styles/Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="stars-background"></div>

            <div className="footer-container">

                <div className="footer-top">

                    {/* Logo */}
                    <div className="footer-logo">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        <span className="brand-name">The Outside</span>
                    </div>

                    {/* Links */}
                    <div className="footer-links">
                        <h3>Navigation</h3>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/solarSystem">Solar System</Link></li>
                            <li><Link to="/ISSTracker">ISS Tracker</Link></li>
                            <li><Link to="/spacefacts">AI Facts</Link></li>
                            <li><Link to="/spacequiz">AI Quiz</Link></li>
                            <li><Link to="/askdoubt">AI Doubt Solving</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div className="social-links">
                        <h3>Connect With Us</h3>
                        <div className="social-icons">
                            <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                            <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2025 The Outside. All rights reserved.</p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
