import React, { useState } from 'react';
import '../styles/AskDoubtPage.css';
import Navbar from '../components/Navbar';

function AskDoubtPage() {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [latestAnswer, setLatestAnswer] = useState(null);
    const [previousQA, setPreviousQA] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        setLatestAnswer(null); // clear previous live answer

        try {
            const res = await fetch("http://localhost:5000/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question }),
            });

            if (!res.ok) throw new Error("Failed to get response from backend.");

            const data = await res.json();
            const answer = (data.answer || "").trim();

            if (!answer) throw new Error("AI returned empty answer.");

            const newEntry = {
                id: previousQA.length + 1,
                question,
                answer,
                date: new Date().toISOString().split('T')[0],
            };

            setPreviousQA([newEntry, ...previousQA]);
            setLatestAnswer(newEntry);
            setQuestion('');
        } catch (err) {
            console.error(err);
            alert("❌ Failed to get answer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredQuestions = previousQA.filter(qa =>
        qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qa.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <div className="doubt-container">
                <main className="doubt-content">
                    <h1 className="section-title">❓ Space Doubts Zone</h1>

                    <div className="ask-panel">
                        <h2>Ask Your Space Question</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="question-input">Your Question</label>
                                <textarea
                                    id="question-input"
                                    className="question-input"
                                    placeholder="What cosmic mystery can we help you solve?"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={!question.trim() || loading}
                            >
                                <span className="button-text">
                                    {loading ? "Thinking..." : "Submit Question"}
                                </span>
                                <div className="button-glow"></div>
                            </button>
                        </form>

                        {latestAnswer && (
                            <div className="latest-answer-card">
                                <h3 className="qa-question">You asked: {latestAnswer.question}</h3>
                                <p className="qa-answer">{latestAnswer.answer}</p>
                            </div>
                        )}
                    </div>

                    <div className="qa-section">
                        <div className="qa-header">
                            <h2>Previous Questions & Answers</h2>
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search questions or answers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="qa-cards">
                            {filteredQuestions.length > 0 ? (
                                filteredQuestions.map(qa => (
                                    <div className="qa-card" key={qa.id}>
                                        <div className="qa-card-header">
                                            <span className="qa-date">{qa.date}</span>
                                        </div>
                                        <h3 className="qa-question">{qa.question}</h3>
                                        <p className="qa-answer">{qa.answer}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>No questions found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default AskDoubtPage;
