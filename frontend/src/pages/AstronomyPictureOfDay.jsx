import React from 'react';
import '../styles/AstronomyPictureOfDay.css';
import NavBar from '../components/Navbar';
function AstronomyPictureOfDay() {
    // Dummy data for the APOD
    const dummyData = {
        title: "Cosmic Wonders: Nebula NGC 1234",
        date: "June 10, 2025",
        explanation: "This stunning nebula, located approximately 4,500 light-years from Earth, showcases the beautiful aftermath of a supernova explosion. The colorful gases and cosmic dust create an ethereal landscape where new stars are being born. Astronomers believe this region has been actively forming stars for the past 3 million years, making it one of the most productive stellar nurseries in our galaxy.",
        image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80"
    };

    return (
        <>
        <NavBar/>
        <div className="apod-container">
            <div className="stars-background"></div>
            
            <div className="apod-content">
                <h1 className="apod-main-title">Astronomy Picture of the Day</h1>
                
                <div className="apod-frame">
                    <div className="frame-header">
                        <div className="frame-indicator"></div>
                        <div className="frame-title">NASA • APOD • {dummyData.date}</div>
                    </div>
                    
                    <div className="image-container">
                        <img 
                            src={dummyData.image} 
                            alt={dummyData.title} 
                            className="apod-image" 
                        />
                    </div>
                    
                    <div className="apod-info">
                        <h2 className="apod-title">{dummyData.title}</h2>
                        <p className="apod-description">{dummyData.explanation}</p>
                    </div>
                </div>
            </div>
        </div></>

    );
}

export default AstronomyPictureOfDay;