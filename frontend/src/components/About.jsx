// src/components/About.jsx
import React from 'react'; // No need for forwardRef
import './comp_styles/About.css';

const About = () => { // No ref prop
    return (
        <div id="about-section" className="about-container"> {/* Removed ref={ref} */}

            <div className="about-content">
                <h2 className="about-title">About The Outside</h2>
                <p className="about-subtitle">Your gateway to the cosmos, powered by innovation.</p>
                <div className="about-grid">
                    <div className="about-card">
                        <h3 className="card-heading">Our Mission</h3>
                        <p className="card-description">
                            "The Outside" is dedicated to bringing the wonders of space closer to everyone.
                            We believe that understanding the universe should be an accessible and engaging experience.
                            Through interactive visualizations, real-time data, and AI-powered learning tools,
                            we aim to ignite curiosity and foster a deeper appreciation for the cosmos.
                        </p>
                    </div>
                    <div className="about-card">
                        <h3 className="card-heading">What We Offer</h3>
                        <ul className="offer-list">
                            <li><span className="bullet-icon">✨</span>Interactive Solar System Simulations</li>
                            <li><span className="bullet-icon">🛰️</span>Real-time Satellite & ISS Tracking</li>
                            <li><span className="bullet-icon">💡</span>AI-powered Space Facts & Quiz Generation</li>
                            <li><span className="bullet-icon">❓</span>Intelligent Doubt Solving for Cosmic Queries</li>
                            <li><span className="bullet-icon">📸</span>Daily Astronomy Picture of the Day from NASA</li>
                        </ul>
                    </div>
                    <div className="about-card">
                        <h3 className="card-heading">Our Vision</h3>
                        <p className="card-description">
                            We envision a future where space exploration and scientific discovery are
                            shared and celebrated by all. By combining cutting-edge technology with
                            captivating design, we strive to make complex astronomical concepts
                            understandable and inspiring for learners of all ages.
                        </p>
                    </div>
                    <div className="about-card">
                        <h3 className="card-heading">Join Our Journey</h3>
                        <p className="card-description">
                            Whether you're an amateur astronomer, a student, or simply fascinated by the stars,
                            "The Outside" offers a unique platform to learn, explore, and connect with the universe.
                            Sign up today to unlock the full potential of our cosmic tools!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;