import React, { useState, useEffect } from 'react';
import '../styles/AISpaceQuiz.css';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; // Import the auth hook
import { toast } from 'react-toastify'; // Import toast for user notifications

function AISpaceQuiz() {
    const navigate = useNavigate();
    const { user, loggedIn, checkingStatus } = useAuthStatus(); // Get user and login status from auth hook

    const [quizStarted, setQuizStarted] = useState(false);
    const [quizTheme, setQuizTheme] = useState('planets');
    const [difficulty, setDifficulty] = useState('medium');

    const [questions, setQuestions] = useState([]);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizError, setQuizError] = useState(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0); // Number of correct answers
    const [userAnswers, setUserAnswers] = useState([]); // Stores details for each answered question

    const [quizHistory, setQuizHistory] = useState([]);
    const [showQuizHistory, setShowQuizHistory] = useState(false);
    const [selectedQuizSummary, setSelectedQuizSummary] = useState(null);

    const [totalXpGainedFromQuiz, setTotalXpGainedFromQuiz] = useState(0); // Tracks total XP for current quiz session

    // Define XP points for each difficulty
    const XP_GAINED = {
        easy: 10,
        medium: 25,
        hard: 50,
    };

    const XP_DEDUCTED = {
        easy: 5,
        medium: 10,
        hard: 20,
    };

    // Backend API Base URL
    const BACKEND_URL = 'http://localhost:5000'; // Ensure this matches the port your backend server is running on


    // Load quiz history from localStorage on component mount
    useEffect(() => {
        const storedQuizHistory = localStorage.getItem('quizHistory');
        if (storedQuizHistory) {
            setQuizHistory(JSON.parse(storedQuizHistory));
        }
    }, []);

    // Save quiz history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    }, [quizHistory]);

    // Function to start a new quiz or replay an old one
    const startQuiz = async (quizToReplay = null) => {
        // Reset all quiz states
        setQuizStarted(false);
        setShowResults(false);
        setScore(0);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setUserAnswers([]);
        setSelectedQuizSummary(null);
        setShowQuizHistory(false);
        setQuizError(null);
        setTotalXpGainedFromQuiz(0); // Reset total XP for new quiz

        // The `quizTheme` state (which could be 'random') is now directly used.
        // The backend will handle generating varied questions if theme is 'random'.

        if (quizToReplay) {
            // Replaying an old quiz
            setQuestions(quizToReplay.questions);
            setQuizTheme(quizToReplay.theme);
            setDifficulty(quizToReplay.difficulty);
            setQuizStarted(true);
            setUserAnswers(quizToReplay.answers.map(a => ({...a, xpChange: a.xpChange || 0}))); // Ensure xpChange exists for old quizzes
            setScore(quizToReplay.score); // Set score for replay summary
            setTotalXpGainedFromQuiz(quizToReplay.totalXpGained || 0); // Set total XP for replay summary
        } else {
            // Generating a new quiz
            setIsGeneratingQuiz(true); // Show loading indicator
            try {
                // Ensure user is logged in before attempting to get quiz (quiz endpoint is protected)
                if (!loggedIn || !user) {
                    toast.error("Please log in to generate quizzes.");
                    navigate('/login');
                    return;
                }
                const idToken = await user.getIdToken(); // Get Firebase ID token for backend authentication

                const res = await fetch(`${BACKEND_URL}/quiz`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}` // Send Firebase ID token
                    },
                    body: JSON.stringify({ theme: quizTheme, difficulty }) // Now directly send quizTheme (which can be 'random')
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                    setQuizStarted(true); // Start the quiz
                } else {
                    setQuizError("No questions received from the AI. Please try again with different settings.");
                }
            } catch (err) {
                console.error("Quiz generation failed:", err);
                setQuizError(`Failed to generate quiz: ${err.message}. Please check your backend server and API key.`);
            } finally {
                setIsGeneratingQuiz(false); // Hide loading indicator
            }
        }
    };

    // Handles user selecting an option for the current question
    const handleOptionSelect = (option) => {
        setSelectedAnswer(option);
    };

    // Handles moving to the next question or finishing the quiz
    const handleNext = async () => { // Make function async to await XP update
        const currentQ = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQ.correctAnswer;
        let xpChangeForQuestion = 0; // XP change for the current question

        if (isCorrect) {
            xpChangeForQuestion = XP_GAINED[difficulty];
            setScore(prevScore => prevScore + 1); // Increment correct answers count
        } else {
            xpChangeForQuestion = -XP_DEDUCTED[difficulty];
        }

        // Add the current question's answer details, including XP change
        const updatedUserAnswers = [
            ...userAnswers,
            {
                question: currentQ.question,
                selected: selectedAnswer,
                correct: currentQ.correctAnswer,
                isCorrect: isCorrect,
                xpChange: xpChangeForQuestion, // Store XP change for this question
            }
        ];
        setUserAnswers(updatedUserAnswers);

        // Update total XP gained for the current quiz session
        const newTotalXpGainedFromQuiz = totalXpGainedFromQuiz + xpChangeForQuestion;
        setTotalXpGainedFromQuiz(newTotalXpGainedFromQuiz);


        // Check if this is the last question
        if (currentQuestionIndex < questions.length - 1) {
            // Not the last question, move to next
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null); // Reset selected answer for next question
        } else {
            // Last question, show results and update user's total XP in DB
            setShowResults(true);

            // Only attempt to update XP if logged in and if there's an actual XP change
            if (loggedIn && user && newTotalXpGainedFromQuiz !== 0) {
                try {
                    const idToken = await user.getIdToken(); // Get Firebase ID token
                    const updateXpResponse = await fetch(`${BACKEND_URL}/api/profiles/${user.uid}/add-xp`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}` // Send Firebase ID token for authentication
                        },
                        body: JSON.stringify({ xpToAdd: newTotalXpGainedFromQuiz }), // Send the total XP change from this quiz
                    });

                    if (!updateXpResponse.ok) {
                        const errorData = await updateXpResponse.json();
                        console.error("Failed to update XP:", errorData);
                        toast.error(`Failed to update XP: ${errorData.error || 'Unknown error'}`);
                    } else {
                        const successData = await updateXpResponse.json();
                        console.log("XP update successful:", successData);
                        toast.success(`XP updated! You gained ${newTotalXpGainedFromQuiz} XP.`);
                        // Navbar's XP display should update automatically due to useAuthStatus listening.
                    }
                } catch (error) {
                    console.error("Error updating user XP:", error);
                    toast.error("An error occurred while updating your XP.");
                }
            }

            // Prepare quiz result object to save to history
            const quizResult = {
                id: Date.now(), // Unique ID for this quiz session
                date: new Date().toLocaleString(),
                theme: quizTheme, // Stores 'random' if chosen, or specific theme
                difficulty: difficulty,
                score: score + (isCorrect ? 1 : 0), // Final score for the quiz
                totalQuestions: questions.length,
                answers: updatedUserAnswers, // Full details of user answers and XP changes per question
                questions: questions, // Store original questions for replay
                totalXpGained: newTotalXpGainedFromQuiz, // Total XP earned/lost in this quiz
            };
            setQuizHistory(prevHistory => [...prevHistory, quizResult]); // Add to history
        }
    };

    // Resets quiz to initial setup screen
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
        setTotalXpGainedFromQuiz(0);
    };

    // Displays quiz history panel
    const viewQuizHistory = () => {
        setShowQuizHistory(true);
        setSelectedQuizSummary(null);
        setQuizStarted(false);
        setShowResults(false);
        setQuizError(null);
    };

    // Views detailed summary of a selected quiz from history
    const viewSummary = (quiz) => {
        setSelectedQuizSummary(quiz);
        setShowQuizHistory(false);
    };

    // Closes the detailed quiz summary
    const closeSummary = () => {
        setSelectedQuizSummary(null);
        // Do not reset other states, allow user to go back to quiz setup from here
        setShowResults(false);
        setShowQuizHistory(false);
        setQuizStarted(false);
        setQuizError(null);
    };

    // Replays a specific quiz from history
    const replayQuiz = (quiz) => {
        startQuiz(quiz); // Call startQuiz with the historical quiz object
    };

    // Navigates back to the main quiz setup from history or summary views
    const goToQuizSetupFromHistory = () => {
        setShowQuizHistory(false);
        setSelectedQuizSummary(null);
        setQuizStarted(false);
        setShowResults(false);
        setQuizError(null);
    };

    // Display loading state for authentication or if user is not logged in
    if (checkingStatus || !loggedIn) {
        return (
            <>
                <Navbar />
                <div className="quiz-container">
                    <div className="stars-background"></div>
                    <div className="nebula-effect"></div>
                    <main className="quiz-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                        {checkingStatus ? (
                            <p className="loading-message">Verifying login status... Please wait. ✨</p>
                        ) : (
                            <p className="loading-message">Please log in to access the AI Space Quiz. 🔑</p>
                        )}
                    </main>
                </div>
            </>
        );
    }

    // Main component rendering logic
    return (
        <>
            <Navbar />
            <div className="quiz-container">
                <div className="stars-background"></div>
                <div className="nebula-effect"></div>

                <main className="quiz-content">
                    <h1 className="section-title">🚀 AI Space Quiz</h1>

                    {/* Quiz Setup Panel */}
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
                        /* Quiz History Panel */
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
                                            {/* Display total XP gained from this quiz session */}
                                            <p><strong>XP Gained:</strong> <span className={quiz.totalXpGained > 0 ? 'xp-gained-summary' : (quiz.totalXpGained < 0 ? 'xp-deducted-summary' : '')}>{quiz.totalXpGained >= 0 ? '+' : ''}{quiz.totalXpGained}</span></p>

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
                        /* Detailed Quiz Summary Panel */
                        <div className="quiz-summary-panel">
                            <h2>Quiz Summary: {selectedQuizSummary.theme} ({selectedQuizSummary.difficulty})</h2>
                            <p className="summary-date">Date: {selectedQuizSummary.date}</p>
                            <p className="summary-score">You scored: {selectedQuizSummary.score} out of {selectedQuizSummary.totalQuestions}</p>
                            {/* Display total XP gained from this specific quiz summary */}
                            <p className="summary-total-xp">Total XP from Quiz: <span className={selectedQuizSummary.totalXpGained > 0 ? 'xp-gained-summary' : (selectedQuizSummary.totalXpGained < 0 ? 'xp-deducted-summary' : '')}>{selectedQuizSummary.totalXpGained >= 0 ? '+' : ''}{selectedQuizSummary.totalXpGained}</span></p>

                            <div className="summary-details">
                                {selectedQuizSummary.answers.map((answer, index) => (
                                    <div key={index} className={`summary-question-item ${answer.isCorrect ? 'correct' : 'wrong'}`}>
                                        <p className="summary-question-text"><strong>Q{index + 1}:</strong> {answer.question}</p>
                                        <p className="summary-your-answer">Your Answer: <span className={answer.isCorrect ? 'correct-answer' : 'wrong-answer'}>{answer.selected || 'No answer selected'}</span></p>
                                        {!answer.isCorrect && (
                                            <p className="summary-correct-answer">Correct Answer: <span>{answer.correct}</span></p>
                                        )}
                                        {/* Display XP change for each question */}
                                        <p className="summary-xp">XP: <span className={answer.xpChange > 0 ? 'xp-gained' : 'xp-deducted'}>{answer.xpChange >= 0 ? '+' : ''}{answer.xpChange}</span></p>
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
                        /* Main Quiz Results Panel (after quiz completion) */
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
                                {/* Display total XP earned/lost immediately after quiz */}
                                <p className="final-xp-summary">
                                    You earned: <span className={totalXpGainedFromQuiz > 0 ? 'xp-gained-summary' : (totalXpGainedFromQuiz < 0 ? 'xp-deducted-summary' : '')}>{totalXpGainedFromQuiz >= 0 ? '+' : ''}{totalXpGainedFromQuiz} XP</span>
                                </p>
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
                        /* Loading state while quiz is generating */
                        <div className="loading-panel">
                            <p>Generating your space quiz questions... Please wait. 🌌</p>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        /* Active Quiz Panel (displaying current question) */
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
                                                    disabled={isGeneratingQuiz} // Disable options during generation
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        className="next-button"
                                        onClick={handleNext}
                                        disabled={selectedAnswer === null || isGeneratingQuiz}
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
