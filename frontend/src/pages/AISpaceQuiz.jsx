import React, {useState} from 'react';
import '../styles/AISpaceQuiz.css';
import Navbar from '../components/Navbar';

function AISpaceQuiz() {
    // State for quiz settings
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizTheme, setQuizTheme] = useState('planets');
    const [difficulty, setDifficulty] = useState('medium');
    const [randomMode, setRandomMode] = useState(false);

    // State for quiz progress
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    // Mock questions data
    const mockQuestions = [
        {
            question: "Which planet has the most moons?",
            options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
            correctAnswer: "Saturn",
            difficulty: "medium",
            theme: "planets"
        },
        {
            question: "What is the hottest planet in our solar system?",
            options: ["Mercury", "Venus", "Mars", "Jupiter"],
            correctAnswer: "Venus",
            difficulty: "easy",
            theme: "planets"
        },
        {
            question: "What type of galaxy is the Milky Way?",
            options: ["Elliptical", "Irregular", "Spiral", "Barred Spiral"],
            correctAnswer: "Barred Spiral",
            difficulty: "hard",
            theme: "galaxies"
        },
        {
            question: "Which mission delivered the first humans to the Moon?",
            options: ["Apollo 10", "Apollo 11", "Apollo 12", "Gemini 4"],
            correctAnswer: "Apollo 11",
            difficulty: "medium",
            theme: "missions"
        },
        {
            question: "What is the name of the nearest star to our Sun?",
            options: ["Betelgeuse", "Proxima Centauri", "Alpha Centauri A", "Sirius"],
            correctAnswer: "Proxima Centauri",
            difficulty: "medium",
            theme: "stars"
        }
    ];

    // Function to start the quiz
    const startQuiz = () => {
        // If random theme is selected, choose a random theme (excluding "random" option)
        if (quizTheme === 'random') {
            const themes = ['planets', 'stars', 'galaxies', 'missions', 'astronomy history'];
            setQuizTheme(themes[Math.floor(Math.random() * themes.length)]);
        }

        setQuizStarted(true);
        setCurrentQuestion(0);
        setScore(0);
        setShowResults(false);
        setSelectedAnswer(null);
    };

    // Function to handle option selection
    const handleOptionSelect = (option) => {
        setSelectedAnswer(option);
    };

    // Function to go to next question or finish quiz
    const handleNext = () => {
        // Update score if answer is correct
        if (selectedAnswer === mockQuestions[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }

        // Move to next question or show results
        if (currentQuestion < mockQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
        } else {
            setShowResults(true);
        }
    };

    // Function to restart quiz
    const restartQuiz = () => {
        setQuizStarted(false);
        setShowResults(false);
        setScore(0);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
    };

    return (
        <>
            <Navbar/>
            <div className="quiz-container">
                <div className="stars-background"></div>
                <div className="nebula-effect"></div>

                <main className="quiz-content">
                    <h1 className="section-title">🚀 AI Space Quiz</h1>

                    {!quizStarted && !showResults ? (
                        <div className="settings-panel">
                            {/* Replace the existing theme select with this */}
                            <div className="setting-group">
                                <label htmlFor="theme-select">Quiz Theme</label>
                                <select
                                    id="theme-select"
                                    className="theme-select"
                                    value={quizTheme}
                                    onChange={(e) => setQuizTheme(e.target.value)}
                                >
                                    <option value="random">Random Theme</option>
                                    <option value="planets">Planets</option>
                                    <option value="stars">Stars</option>
                                    <option value="galaxies">Galaxies</option>
                                    <option value="missions">Missions</option>
                                    <option value="astronomy history">Astronomy History</option>
                                </select>
                            </div>

                            {/* Remove the entire toggle-group section that contains the random mode toggle */}

                            <div className="setting-group">
                                <label htmlFor="difficulty-select">Difficulty</label>
                                <div className="difficulty-buttons">
                                    <button
                                        className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
                                        onClick={() => !randomMode && setDifficulty('easy')}
                                        disabled={randomMode}
                                    >
                                        Easy
                                    </button>
                                    <button
                                        className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
                                        onClick={() => !randomMode && setDifficulty('medium')}
                                        disabled={randomMode}
                                    >
                                        Medium
                                    </button>
                                    <button
                                        className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
                                        onClick={() => !randomMode && setDifficulty('hard')}
                                        disabled={randomMode}
                                    >
                                        Hard
                                    </button>
                                </div>
                            </div>


                            <button
                                className="start-button"
                                onClick={startQuiz}
                            >
                                <span className="button-text">Start Quiz</span>
                                <div className="button-glow"></div>
                            </button>
                        </div>
                    ) : showResults ? (
                        <div className="results-panel">
                            <div className="results-header">
                                <h2>Quiz Complete!</h2>
                                <div className="score-display">
                                    <span className="score-value">{score}</span>
                                    <span className="score-divider">/</span>
                                    <span className="score-total">{mockQuestions.length}</span>
                                </div>
                            </div>

                            <div className="results-message">
                                {score === mockQuestions.length ? (
                                    <p>Perfect score! You're a space genius! 🌟</p>
                                ) : score >= mockQuestions.length * 0.7 ? (
                                    <p>Great job! You know your space facts! 🚀</p>
                                ) : score >= mockQuestions.length * 0.5 ? (
                                    <p>Good effort! Keep exploring the cosmos! 🔭</p>
                                ) : (
                                    <p>Keep studying the stars! The universe is vast and full of wonders! ✨</p>
                                )}
                            </div>

                            <button
                                className="restart-button"
                                onClick={restartQuiz}
                            >
                                <span className="button-text">Try Again</span>
                                <div className="button-glow"></div>
                            </button>
                        </div>
                    ) : (
                        <div className="quiz-panel">
                            <div className="progress-indicator">
                                <div className="progress-text">
                                    Question {currentQuestion + 1}/{mockQuestions.length}
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar"
                                        style={{width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%`}}
                                    ></div>
                                </div>
                            </div>

                            <div className="question-card">
                                <h2 className="question-text">{mockQuestions[currentQuestion].question}</h2>

                                <div className="options-container">
                                    {mockQuestions[currentQuestion].options.map((option, index) => (
                                        <button
                                            key={index}
                                            className={`option-button ${selectedAnswer === option ? 'selected' : ''}`}
                                            onClick={() => handleOptionSelect(option)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                className="next-button"
                                onClick={handleNext}
                                disabled={selectedAnswer === null}
                            >
                                <span className="button-text">
                                    {currentQuestion < mockQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                </span>
                                <div className="button-glow"></div>
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

export default AISpaceQuiz;