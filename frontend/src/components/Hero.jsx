// src/components/Hero.jsx
import React from 'react'; // No need for forwardRef
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import '../components/comp_styles/Hero.css';

const Hero = () => { // No ref prop
    const navigate = useNavigate();
    const { loggedIn, checkingStatus } = useAuthStatus();

    if (checkingStatus) {
        return (
            <div className="hero-container" id="hero-section"> 
                <div className="glass-card">
                    <h1 className="hero-title">Loading Universe...</h1>
                    <p className="hero-subtitle">Getting ready to explore.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hero-container comp" id="hero-section"> {/* Removed ref={ref} */}

            <div className="glass-card">
                <h1 className="hero-title">Explore the Universe from The Outside</h1>
                <h2 className="hero-subtitle">
                    Visualize the Solar System, Track ISS, Learn with AI-powered facts and quizzes
                </h2>
                <div className="cta-buttons">
                    <button className="cta-primary"
                            onClick={() => {
                                if (loggedIn) {
                                    navigate('/dashboard');
                                } else {
                                    navigate('/login');
                                }
                            }}
                    >
                        Explore Now
                    </button>
                    {loggedIn && (
                        <button className="cta-secondary"
                                onClick={() => navigate('/spacequiz')}
                        >
                            Take a Quiz
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Hero;