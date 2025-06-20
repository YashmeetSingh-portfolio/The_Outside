// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // NEW: Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // NEW: Import Toastify CSS

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ExploreSolarSystem from './pages/ExploreSolarSystem.jsx';
import ISSTracker from './pages/ISSTracker.jsx';
import AISpaceFacts from './pages/AISpaceFacts.jsx';
import AISpaceQuiz from './pages/AISpaceQuiz.jsx';
import AskDoubtPage from './pages/AskDoubtPage.jsx';
import AstronomyPictureOfDay from './pages/AstronomyPictureOfDay.jsx';
import PrivateRoute from './components/PrivateRoute';
import { useAuthStatus } from './hooks/useAuthStatus';
import 'leaflet/dist/leaflet.css';

function App() {
    const { checkingStatus } = useAuthStatus();

    if (checkingStatus) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0a20', color: 'white', fontSize: '2rem' }}>Loading The Outside...</div>;
    }

    return (
        <Router>
            {/* NEW: ToastContainer for global notifications */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark" // Or 'light' or 'colored'
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route path="/solarSystem" element={<PrivateRoute><ExploreSolarSystem /></PrivateRoute>} />
                <Route path="/ISSTracking" element={<PrivateRoute><ISSTracker /></PrivateRoute>} />
                <Route path="/spacefacts" element={<PrivateRoute><AISpaceFacts /></PrivateRoute>} />
                <Route path="/spacequiz" element={<PrivateRoute><AISpaceQuiz /></PrivateRoute>} />
                <Route path="/askdoubt" element={<PrivateRoute><AskDoubtPage /></PrivateRoute>} />
                <Route path="/apod" element={<PrivateRoute><AstronomyPictureOfDay /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><div>Welcome to your Dashboard!</div></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;