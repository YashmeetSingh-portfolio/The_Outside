// src/components/MissionHighlights.jsx
import React from 'react'; // No need for forwardRef
import '../components/comp_styles/MissionHighlights.css';

const MissionHighlights = () => { // No ref prop
    const features = [
        { icon: '🪐', title: 'Visualize the Solar System', description: 'Interactive 3D models of planets and their orbits with detailed information.' },
        { icon: '🛰️', title: 'Live Space Tracking', description: 'Real-time tracking of satellites, ISS, and other space objects.' },
        { icon: '🤖', title: 'AI Space Assistant', description: 'Get answers to your space questions with our advanced AI assistant.' },
        { icon: '🧠', title: 'Space Knowledge Quiz', description: 'Test your knowledge with our interactive space quizzes and challenges.' }
    ];

    return (
        <div className="mission-container comp" id="features-section"> {/* Removed ref={ref} */}
            <div className="mission-content">
                <h2 className="mission-title">Mission Highlights</h2>
                <p className="mission-subtitle">From planetary journeys to live space tracking — it's all here.</p>
                <div className="feature-grid">
                    {features.map((feature, index) => (
                        <div className="feature-card" key={index}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MissionHighlights;