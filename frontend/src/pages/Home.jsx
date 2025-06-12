import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import MissionHighlights from '../components/MissionHighlights.jsx';

function Home() {
    return (
        <>
            <Navbar/>
            <Hero/>
            <MissionHighlights/>
            <Footer/>
        </>
    );
}

export default Home;