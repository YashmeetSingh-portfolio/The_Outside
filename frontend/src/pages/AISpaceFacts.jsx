import React, { useState } from 'react';
import '../styles/AISpaceFacts.css';
import Navbar from '../components/Navbar';

function AISpaceFacts() {
    const [currentFact, setCurrentFact] = useState("Click the button to get an AI-generated space fact!");
    const [factHistory, setFactHistory] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Function to get a new AI-generated fact from the backend
   const generateFact = async () => {
    setIsGenerating(true);

    try {
        const res = await fetch("http://localhost:5000/fact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();
        const newFact = data.fact || "Unable to fetch a space fact at this moment.";

        // Only store the current fact if it's not the initial placeholder
        if (currentFact !== "Click the button to get an AI-generated space fact!") {
            setFactHistory(prev => [currentFact, ...prev].slice(0, 10));
        }

        setCurrentFact(newFact);
    } catch (err) {
        console.error("Error fetching space fact:", err);
        setCurrentFact("There was an error generating a new fact. Please try again.");
    } finally {
        setIsGenerating(false);
    }
    };


    return (
        <>
            <Navbar />
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
                            <span className="button-text">
                                {isGenerating ? "Generating..." : "Generate Fact"}
                            </span>
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
