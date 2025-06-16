import React, { useState } from 'react';
import '../styles/AISpaceFacts.css';
import Navbar from '../components/Navbar';

function AISpaceFacts() {
    const [currentFact, setCurrentFact] = useState("Click the button to get an AI-generated space fact!");
    // factHistory will store up to 10 previous facts to avoid repetition
    const [factHistory, setFactHistory] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Function to get a new AI-generated fact from the backend
    const generateFact = async () => {
        setIsGenerating(true);

        try {
            // Prepare the facts to exclude from the new generation
            const factsToExclude = factHistory;

            const res = await fetch(`${backendUrl}/fact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                // Send the history of facts to the backend
                body: JSON.stringify({ forbiddenFacts: factsToExclude })
            });

            const data = await res.json();
            const newFact = data.fact || "Unable to fetch a space fact at this moment.";

            // Only store the current fact if it's not the initial placeholder
            // and if it's a valid, non-empty fact to avoid adding errors/placeholders to history
            if (currentFact && currentFact !== "Click the button to get an AI-generated space fact!" && newFact !== currentFact) {
                // Add the current fact to history, limiting to the latest 10
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
