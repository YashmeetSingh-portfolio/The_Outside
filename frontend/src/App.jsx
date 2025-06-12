import React from 'react';
import ReactDOM from "react-dom/client";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ExploreSolarSystem from './pages/ExploreSolarSystem.jsx'
import ISSTracker from './pages/ISSTracker.jsx'
import AISpaceFacts from './pages/AISpaceFacts.jsx'
import AISpaceQuiz from './pages/AISpaceQuiz.jsx'
import AskDoubtPage from './pages/AskDoubtPage.jsx'
import AstronomyPictureOfDay from './pages/AstronomyPictureOfDay.jsx'
import 'leaflet/dist/leaflet.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home/>}>

                </Route>
                <Route path="/login" element={<Login/>}>
                </Route>
                <Route path="/signup" element={<Signup/>}>
                </Route>
                <Route path="/solarSystem" element={<ExploreSolarSystem/>}>
                </Route>
                <Route path="/ISSTracking" element={<ISSTracker/>}>
                </Route>
                <Route path="/spacefacts" element={<AISpaceFacts/>}>
                </Route>
                <Route path="/spacequiz" element={<AISpaceQuiz/>}>
                </Route>
                <Route path="/askdoubt" element={<AskDoubtPage/>}>
                </Route>
                <Route path="/apod" element={<AstronomyPictureOfDay/>}>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
export default App
