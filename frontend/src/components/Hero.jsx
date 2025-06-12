import React from 'react';
import '../components/comp_styles/Hero.css';
import {useNavigate} from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();
    return (
        <div className="hero-container">
            <div className="stars-background"></div>
            <div className="glass-card">
                <h1 className="hero-title">Explore the Universe from The Outside</h1>
                <h2 className="hero-subtitle">
                    Visualize the Solar System, Track ISS, Learn with AI-powered facts and quizzes
                </h2>
                <div className="cta-buttons">
                    <button className="cta-primary"
                            onClick={() => navigate('/login')}
                    >Explore Now
                    </button>
                    <button className="cta-secondary"
                            onClick={() => navigate('/spacequiz')}
                    >Take a Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
