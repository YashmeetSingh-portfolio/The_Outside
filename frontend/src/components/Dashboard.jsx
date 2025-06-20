import React from 'react';
import './comp_styles/Dashboard.css'

const Dashboard = () => {
    return (
        <div className="cockpit-hero">
            <div className="cockpit-overlay"></div>

            <div className="cockpit-hud">
                <div className="cockpit-heading">
                    <span className="hud-label">COMMAND LOG</span>
                    <h1>Welcome Commander</h1>
                    <p>All systems nominal. Begin your mission below.</p>
                </div>

                <div className="hud-panels">
                    <div className="hud-panel">🛰 ISS: <span className="online-dot"></span> Online</div>
                    <div className="hud-panel">🌌 APOD: Synced</div>
                    <div className="hud-panel">🤖 AI Facts: Loaded</div>
                    <div className="hud-panel">🧠 AI Quiz: Framed</div>
                    <div className="hud-panel">❓ AI Doubt Solving: <span className="online-dot"></span> Online</div>
                </div>
            </div>

            {/* Arrow now at the bottom of cockpit */}
            <div className="cockpit-arrow" onClick={() => {
                const section = document.getElementById('destination-selection');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }}>
                <span className="arrow-text">Please mark your destination</span>
                <div className="arrow-down">⬇</div>
            </div>

        </div>


    );
};

export default Dashboard;
