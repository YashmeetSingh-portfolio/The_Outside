import React, {useState} from 'react';
import '../styles/AISpaceFacts.css';
import Navbar from '../components/Navbar';

function AISpaceFacts() {
    const [currentFact, setCurrentFact] = useState("The universe is approximately 13.8 billion years old, based on measurements of cosmic microwave background radiation.");
    const [factHistory, setFactHistory] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Function to simulate generating a new fact
    const generateFact = () => {
        setIsGenerating(true);

        // Simulate API call delay
        setTimeout(() => {
            const facts = [
                "Saturn's rings are mostly made of ice particles, with a small amount of rocky debris and dust.",
                "A day on Venus is longer than a year on Venus. Venus takes 243 Earth days to rotate once on its axis but only 225 Earth days to orbit the Sun.",
                "The largest volcano in our solar system is Olympus Mons on Mars, standing nearly 22 km high and 600 km across.",
                "There are more stars in the universe than grains of sand on all the beaches on Earth.",
                "The Milky Way galaxy is on a collision course with the Andromeda galaxy. They will merge in about 4.5 billion years.",
                "Neutron stars are so dense that a teaspoon of neutron star material would weigh about 4 billion tons.",
                "The Great Red Spot on Jupiter is a storm that has been raging for at least 400 years.",
                "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth."
            ];

            const newFact = facts[Math.floor(Math.random() * facts.length)];
            setFactHistory(prev => [currentFact, ...prev].slice(0, 10));
            setCurrentFact(newFact);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <>
            <Navbar/>
            <div className="space-facts-container">
                <div className="stars-background"></div>
                <div className="nebula-effect"></div>

                <main className="space-facts-content">
                    <h1 className="section-title">🧠 AI Space Facts</h1>

                    <div className="fact-card-container">
                        <div className={`fact-card ${isGenerating ? 'generating' : ''}`}>
                            <div className="fact-text">{currentFact}</div>
                        </div>

                        <button
                            className="generate-button"
                            onClick={generateFact}
                            disabled={isGenerating}
                        >
                            <span className="button-text">Generate Fact</span>
                            <div className="button-glow"></div>
                        </button>
                    </div>

                    {factHistory.length > 0 && (
                        <div className="fact-history-panel">
                            <h2 className="history-title">Previous Facts</h2>
                            <div className="fact-history-list">
                                {factHistory.map((fact, index) => (
                                    <div key={index} className="history-item">
                                        <div className="history-indicator"></div>
                                        <p>{fact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

export default AISpaceFacts;