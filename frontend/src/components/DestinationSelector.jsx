import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './comp_styles/DestinationSelector.css';

const destinations = [
    { title: 'ISS Tracking', subtitle: 'International Space Station Tracker', route: '/ISSTracking' },
    { title: 'APOD', subtitle: 'Astronomy Picture of the Day', route: '/apod' },
    { title: 'Solar System', subtitle: 'Explore Planets in 3D', route: '/solarSystem' },
    { title: 'AI Quiz Room', subtitle: 'Challenge Yourself with Space Quizzes', route: '/spacequiz' },
    { title: 'AI Facts Room', subtitle: 'Learn Amazing AI Space Facts', route: '/spacefacts' },
    { title: 'AI Doubt Room', subtitle: 'Ask Your Cosmic Questions', route: '/askdoubt' }
];

const DestinationSelector = () => {
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

    const handleTeleport = () => {
        if (selected) navigate(selected);
    };

    return (
        <div className="destination-container" id="destination-selection">
            <h2 className="destination-heading">🪐 Please Mark Your Destination</h2>
            <div className="destination-grid">
                {destinations.map((dest, idx) => (
                    <div
                        key={idx}
                        className={`destination-card ${selected === dest.route ? 'selected' : ''}`}
                        onClick={() => setSelected(dest.route)}
                    >
                        <h3>{dest.title}</h3>
                        <p>{dest.subtitle}</p>
                    </div>
                ))}
            </div>

            <button
                className="teleport-button"
                disabled={!selected}
                onClick={handleTeleport}
            >
                🚀 Teleport to Destination
            </button>
        </div>
    );
};

export default DestinationSelector;
