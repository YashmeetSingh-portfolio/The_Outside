import React, {useState} from 'react';
import '../styles/AskDoubtPage.css';
import Navbar from '../components/Navbar';

function AskDoubtPage() {
    // State for form inputs
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState('astronomy');
    const [tags, setTags] = useState('');

    // Mock data for previous questions and answers
    const [previousQA, setPreviousQA] = useState([
        {
            id: 1,
            question: "What causes the rings of Saturn to be visible from Earth?",
            answer: "Saturn's rings are visible from Earth because they're made of ice and rock particles that reflect sunlight. The rings' particles range from tiny dust-sized particles to chunks as large as mountains, and they orbit Saturn in a thin plane. When sunlight hits these particles, they reflect the light back to us, making the rings visible through telescopes.",
            category: "Planets",
            tags: ["saturn", "rings", "solar system"],
            date: "2023-10-15"
        },
        {
            id: 2,
            question: "How do black holes form?",
            answer: "Black holes typically form when massive stars (at least 20 times the mass of our Sun) run out of fuel and collapse under their own gravity. This collapse is so extreme that it creates a singularity - a point of infinite density. The gravitational pull becomes so strong that nothing, not even light, can escape once it passes the event horizon, which is why we call them 'black' holes.",
            category: "Black Holes",
            tags: ["gravity", "stars", "astrophysics"],
            date: "2023-10-10"
        },
        {
            id: 3,
            question: "What was the purpose of the James Webb Space Telescope?",
            answer: "The James Webb Space Telescope (JWST) was designed to observe the universe in infrared light, allowing it to see through cosmic dust clouds and study objects too old, distant, or faint for other telescopes. Its primary goals include studying the formation of stars and planets, the evolution of galaxies, and potentially detecting the atmospheres of exoplanets that might harbor life.",
            category: "Space Missions",
            tags: ["telescope", "NASA", "infrared"],
            date: "2023-10-05"
        }
    ]);

    // State for search/filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would send data to a backend
        // For now, we'll just add it to our mock data
        const newQuestion = {
            id: previousQA.length + 1,
            question: question,
            answer: "This question is pending an answer from our space experts.",
            category: category,
            tags: tags.split(',').map(tag => tag.trim()),
            date: new Date().toISOString().split('T')[0]
        };

        setPreviousQA([newQuestion, ...previousQA]);

        // Reset form
        setQuestion('');
        setTags('');
    };

    // Filter questions based on search term and category
    const filteredQuestions = previousQA.filter(qa => {
        const matchesSearch = qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            qa.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            qa.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = filterCategory === 'all' || qa.category.toLowerCase() === filterCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <Navbar/>
            <div className="doubt-container">
                <div className="stars-background"></div>
                <div className="nebula-effect"></div>
                <div className="floating-astronaut"></div>

                <main className="doubt-content">
                    <h1 className="section-title">❓ Space Doubts Zone</h1>

                    {/* Ask Doubt Panel */}
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

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="category-select">Category</label>
                                    <select
                                        id="category-select"
                                        className="category-select"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="astronomy">Astronomy</option>
                                        <option value="astrophysics">Astrophysics</option>
                                        <option value="planets">Planets</option>
                                        <option value="space missions">Space Missions</option>
                                        <option value="black holes">Black Holes</option>
                                        <option value="stars">Stars</option>
                                        <option value="galaxies">Galaxies</option>
                                        <option value="cosmology">Cosmology</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="tags-input">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        id="tags-input"
                                        className="tags-input"
                                        placeholder="e.g. mars, rover, exploration"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={!question.trim()}
                            >
                                <span className="button-text">Submit Question</span>
                                <div className="button-glow"></div>
                            </button>
                        </form>
                    </div>

                    {/* Q&A Display Section */}
                    <div className="qa-section">
                        <div className="qa-header">
                            <h2>Previous Questions & Answers</h2>

                            <div className="filter-controls">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="Search questions or answers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="category-filter">
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="astronomy">Astronomy</option>
                                        <option value="astrophysics">Astrophysics</option>
                                        <option value="planets">Planets</option>
                                        <option value="space missions">Space Missions</option>
                                        <option value="black holes">Black Holes</option>
                                        <option value="stars">Stars</option>
                                        <option value="galaxies">Galaxies</option>
                                        <option value="cosmology">Cosmology</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="qa-cards">
                            {filteredQuestions.length > 0 ? (
                                filteredQuestions.map(qa => (
                                    <div className="qa-card" key={qa.id}>
                                        <div className="qa-card-header">
                                            <span className="qa-category">{qa.category}</span>
                                            <span className="qa-date">{qa.date}</span>
                                        </div>

                                        <h3 className="qa-question">{qa.question}</h3>
                                        <p className="qa-answer">{qa.answer}</p>

                                        <div className="qa-tags">
                                            {qa.tags.map((tag, index) => (
                                                <span className="qa-tag" key={index}>#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>No questions found matching your search criteria.</p>
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