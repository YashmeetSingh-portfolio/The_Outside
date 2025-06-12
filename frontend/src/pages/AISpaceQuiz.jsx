import React, { useState, useEffect } from 'react';
import '../styles/AISpaceQuiz.css';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

function AISpaceQuiz() {
    const navigate = useNavigate();
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizTheme, setQuizTheme] = useState('planets');
    const [difficulty, setDifficulty] = useState('medium');

    const [questions, setQuestions] = useState([]);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizError, setQuizError] = useState(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);

    const [quizHistory, setQuizHistory] = useState([]);
    const [showQuizHistory, setShowQuizHistory] = useState(false);
    const [selectedQuizSummary, setSelectedQuizSummary] = useState(null);

    useEffect(() => {
        const storedQuizHistory = localStorage.getItem('quizHistory');
        if (storedQuizHistory) {
            setQuizHistory(JSON.parse(storedQuizHistory));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    }, [quizHistory]);

    const startQuiz = async (quizToReplay = null) => {
        setQuizStarted(false);
        setShowResults(false);
        setScore(0);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setUserAnswers([]);
        setSelectedQuizSummary(null);
        setShowQuizHistory(false);
        setQuizError(null);

        let actualTheme = quizTheme;
        if (quizTheme === 'random') {
            const themes = ['planets', 'stars', 'galaxies', 'missions', 'astronomy history', 'black holes', 'exoplanets', 'cosmology'];
            actualTheme = themes[Math.floor(Math.random() * themes.length)];
            setQuizTheme(actualTheme);
        }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;


        if (quizToReplay) {
            setQuestions(quizToReplay.questions);
            setQuizTheme(quizToReplay.theme);
            setDifficulty(quizToReplay.difficulty);
            setQuizStarted(true);
        } else {
            setIsGeneratingQuiz(true);
            try {
                const res = await fetch(`${backendUrl}/quiz`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ theme: actualTheme, difficulty })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                    setQuizStarted(true);
                } else {
                    setQuizError("No questions received from the AI. Please try again with different settings.");
                }
            } catch (err) {
                setQuizError(`Failed to generate quiz: ${err.message}. Please check your backend server and API key.`);
            } finally {
                setIsGeneratingQuiz(false);
            }
        }
    };

    const handleOptionSelect = (option) => {
        setSelectedAnswer(option);
    };

    const handleNext = () => {
        const currentQ = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQ.correctAnswer;

        const updatedUserAnswers = [
            ...userAnswers,
            {
                question: currentQ.question,
                selected: selectedAnswer,
                correct: currentQ.correctAnswer,
                isCorrect: isCorrect,
            }
        ];
        setUserAnswers(updatedUserAnswers);

        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
        } else {
            setShowResults(true);
            const finalScore = score + (isCorrect ? 1 : 0);
            const quizResult = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                theme: quizTheme,
                difficulty: difficulty,
                score: finalScore,
                totalQuestions: questions.length,
                answers: updatedUserAnswers,
                questions: questions,
            };
            setQuizHistory(prevHistory => [...prevHistory, quizResult]);
        }
    };

    const restartQuiz = () => {
        setQuizStarted(false);
        setShowResults(false);
        setScore(0);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setUserAnswers([]);
        setQuestions([]);
        setQuizError(null);
        setShowQuizHistory(false);
        setSelectedQuizSummary(null);
    };

    const viewQuizHistory = () => {
        setShowQuizHistory(true);
        setSelectedQuizSummary(null);
        setQuizStarted(false);
        setShowResults(false);
        setQuizError(null);
    };

    const viewSummary = (quiz) => {
        setSelectedQuizSummary(quiz);
        setShowQuizHistory(false);
    };

    const closeSummary = () => {
        setSelectedQuizSummary(null);
        setShowResults(false);
        setShowQuizHistory(false);
        setQuizStarted(false);
        setQuizError(null);
    };

    const replayQuiz = (quiz) => {
        startQuiz(quiz);
    };

    const goToQuizSetupFromHistory = () => {
        setShowQuizHistory(false);
        setSelectedQuizSummary(null);
        setQuizStarted(false);
        setShowResults(false);
        setQuizError(null);
    };

    return (
        <>
            <Navbar />
            <div className="quiz-container">
                <div className="stars-background"></div>
                <div className="nebula-effect"></div>

                <main className="quiz-content">
                    <h1 className="section-title">🚀 AI Space Quiz</h1>

                    {!quizStarted && !showResults && !showQuizHistory && !selectedQuizSummary ? (
                        <div className="settings-panel">
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
                                    <option value="black holes">Black Holes</option>
                                    <option value="exoplanets">Exoplanets</option>
                                    <option value="cosmology">Cosmology</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label htmlFor="difficulty-select">Difficulty</label>
                                <div className="difficulty-buttons">
                                    <button
                                        className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
                                        onClick={() => setDifficulty('easy')}
                                    >
                                        Easy
                                    </button>
                                    <button
                                        className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
                                        onClick={() => setDifficulty('medium')}
                                    >
                                        Medium
                                    </button>
                                    <button
                                        className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
                                        onClick={() => setDifficulty('hard')}
                                    >
                                        Hard
                                    </button>
                                </div>
                            </div>

                            <button className="start-button" onClick={() => startQuiz()} disabled={isGeneratingQuiz}>
                                <span className="button-text">
                                    {isGeneratingQuiz ? "Generating Quiz..." : "Start Quiz"}
                                </span>
                                <div className="button-glow"></div>
                            </button>
                            <button className="view-history-button" onClick={viewQuizHistory} disabled={isGeneratingQuiz}>
                                <span className="button-text">View Quiz History</span>
                                <div className="button-glow"></div>
                            </button>
                            {quizError && <p className="error-message">{quizError}</p>}
                        </div>
                    ) : showQuizHistory ? (
                        <div className="quiz-history-panel">
                            <h2>Quiz History</h2>
                            {quizHistory.length === 0 ? (
                                <p>No quiz history available yet. Start a quiz to see it here!</p>
                            ) : (
                                <div className="history-list">
                                    {quizHistory.map((quiz) => (
                                        <div key={quiz.id} className="history-item">
                                            <p><strong>Date:</strong> {quiz.date}</p>
                                            <p><strong>Theme:</strong> {quiz.theme}</p>
                                            <p><strong>Difficulty:</strong> {quiz.difficulty}</p>
                                            <p><strong>Score:</strong> {quiz.score}/{quiz.totalQuestions}</p>
                                            <button className="view-summary-button" onClick={() => viewSummary(quiz)}>
                                                View Summary
                                            </button>
                                            <button className="replay-button" onClick={() => replayQuiz(quiz)}>
                                                Replay Quiz
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button className="back-button" onClick={goToQuizSetupFromHistory}>
                                <span className="button-text">Go to Quiz Setup</span>
                                <div className="button-glow"></div>
                            </button>
                        </div>
                    ) : selectedQuizSummary ? (
                        <div className="quiz-summary-panel">
                            <h2>Quiz Summary: {selectedQuizSummary.theme} ({selectedQuizSummary.difficulty})</h2>
                            <p className="summary-date">Date: {selectedQuizSummary.date}</p>
                            <p className="summary-score">You scored: {selectedQuizSummary.score} out of {selectedQuizSummary.totalQuestions}</p>

                            <div className="summary-details">
                                {selectedQuizSummary.answers.map((answer, index) => (
                                    <div key={index} className={`summary-question-item ${answer.isCorrect ? 'correct' : 'wrong'}`}>
                                        <p className="summary-question-text"><strong>Q{index + 1}:</strong> {answer.question}</p>
                                        <p className="summary-your-answer">Your Answer: <span className={answer.isCorrect ? 'correct-answer' : 'wrong-answer'}>{answer.selected || 'No answer selected'}</span></p>
                                        {!answer.isCorrect && (
                                            <p className="summary-correct-answer">Correct Answer: <span>{answer.correct}</span></p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="summary-actions">
                                <button className="back-button" onClick={closeSummary}>
                                    <span className="button-text">Back to Quiz Setup</span>
                                    <div className="button-glow"></div>
                                </button>
                                <button className="replay-button" onClick={() => replayQuiz(selectedQuizSummary)}>
                                    <span className="button-text">Replay Quiz</span>
                                    <div className="button-glow"></div>
                                </button>
                            </div>
                        </div>
                    ) : showResults ? (
                        <div className="results-panel">
                            <div className="results-header">
                                <h2>Quiz Complete!</h2>
                                <div className="score-display">
                                    <span className="score-value">{score}</span>
                                    <span className="score-divider">/</span>
                                    <span className="score-total">{questions.length}</span>
                                </div>
                            </div>

                            <div className="results-message">
                                {score === questions.length ? (
                                    <p>Perfect score! You're a space genius! 🌟</p>
                                ) : score >= questions.length * 0.7 ? (
                                    <p>Great job! You know your space facts! 🚀</p>
                                ) : score >= questions.length * 0.5 ? (
                                    <p>Good effort! Keep exploring the cosmos! 🔭</p>
                                ) : (
                                    <p>Keep studying the stars! The universe is vast and full of wonders! ✨</p>
                                )}
                            </div>

                            <button className="view-summary-button" onClick={() => viewSummary(quizHistory[quizHistory.length - 1])}>
                                <span className="button-text">View Quiz Summary</span>
                                <div className="button-glow"></div>
                            </button>
                            <button className="restart-button" onClick={restartQuiz}>
                                <span className="button-text">Start New Quiz</span>
                                <div className="button-glow"></div>
                            </button>
                        </div>
                    ) : isGeneratingQuiz ? (
                        <div className="loading-panel">
                            <p>Generating your space quiz questions... Please wait. 🌌</p>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="quiz-panel">
                            {questions.length > 0 ? (
                                <>
                                    <div className="progress-indicator">
                                        <div className="progress-text">
                                            Question {currentQuestionIndex + 1}/{questions.length}
                                        </div>
                                        <div className="progress-bar-container">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="question-card">
                                        <h2 className="question-text">{questions[currentQuestionIndex].question}</h2>

                                        <div className="options-container">
                                            {questions[currentQuestionIndex].options.map((option, index) => (
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
                                            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                        </span>
                                        <div className="button-glow"></div>
                                    </button>
                                </>
                            ) : (
                                <p>No questions available for the quiz. Please select settings and try again.</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

export default AISpaceQuiz;
