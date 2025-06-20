import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import MissionHighlights from '../components/MissionHighlights.jsx';
import About from '../components/About';
import Dashboard from '../components/Dashboard';
import { useAuthStatus } from '../hooks/useAuthStatus';
import DestinationSelector from '../components/DestinationSelector.jsx';

function Home() {
    const { loggedIn, checkingStatus } = useAuthStatus();

    if (checkingStatus) {
        // Optional: render a loader or skeleton while checking
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar />
            {loggedIn ? (
                <>
                <Dashboard />
                <DestinationSelector/>
                </>
            ) : (
                <>
                    <Hero />
                    <MissionHighlights />
                    <About />
                    <Footer />
                </>
            )}
        </>
    );
}

export default Home;
