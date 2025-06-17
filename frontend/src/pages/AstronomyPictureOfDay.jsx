// AstronomyPictureOfDay.jsx

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import axios from 'axios'; // Import axios for HTTP requests
import '../styles/AstronomyPictureOfDay.css';
import NavBar from '../components/Navbar';

function AstronomyPictureOfDay() {
    // State to store the APOD data
    const [apodData, setApodData] = useState(null);
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State to store any error messages
    const [error, setError] = useState(null);
    // State for the date selected by the user (YYYY-MM-DD format)
    const [selectedDate, setSelectedDate] = useState('');

    // Function to fetch APOD data from the backend
    const fetchApodData = async (date = '') => {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any previous errors

        try {
            // Construct the URL to your Node.js backend APOD endpoint
            // Make sure the port matches your backend server's port (e.g., 5000)
            const apiUrl = date
                ? `http://localhost:5000/api/apod?date=${date}`
                : `http://localhost:5000/api/apod`;

            const response = await axios.get(apiUrl);
            setApodData(response.data); // Set the fetched data to state
        } catch (err) {
            console.error('Error fetching APOD data:', err);
            // Extract a user-friendly error message
            setError(err.response?.data?.error || 'Failed to fetch Astronomy Picture of the Day. Please try again later.');
            setApodData(null); // Clear data on error
        } finally {
            setLoading(false); // Set loading to false after fetch attempt
        }
    };

    // useEffect hook to fetch APOD data when the component mounts
    useEffect(() => {
        fetchApodData(); // Fetch today's APOD by default
    }, []); // Empty dependency array means this runs once on mount

    // Handler for date input change
    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    // Handler for form submission (when user clicks "Get APOD")
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        fetchApodData(selectedDate); // Fetch APOD for the selected date
    };

    // Helper to format date for display if needed
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <NavBar />
            <div className="apod-container">
                <div className="stars-background"></div>

                <div className="apod-content">
                    <h1 className="apod-main-title">Astronomy Picture of the Day</h1>

                    {/* Date Selection Form */}
                    <form onSubmit={handleSubmit} className="apod-date-form">
                        <label htmlFor="apod-date-input">Select a Date:</label>
                        <input
                            type="date"
                            id="apod-date-input"
                            value={selectedDate}
                            onChange={handleDateChange}
                            // Set max date to today's date (formatted YYYY-MM-DD)
                            max={new Date().toISOString().split('T')[0]}
                            // APOD API started on 1995-06-16
                            min="1995-06-16"
                        />
                        <button type="submit">Get APOD</button>
                    </form>

                    {/* Conditional Rendering based on fetch status */}
                    {loading && <p className="apod-message">Loading Astronomy Picture of the Day...</p>}
                    {error && <p className="apod-error-message">Error: {error}</p>}

                    {/* Display APOD data once loaded and no error */}
                    {apodData && !loading && !error && (
                        <div className="apod-frame">
                            <div className="frame-header">
                                <div className="frame-indicator"></div>
                                {/* Use actual fetched date */}
                                <div className="frame-title">NASA • APOD • {formatDateForDisplay(apodData.date)}</div>
                            </div>

                            <div className="image-container">
                                {apodData.media_type === 'image' ? (
                                    <img
                                        src={apodData.hdurl || apodData.url} // Prefer HD URL if available
                                        alt={apodData.title}
                                        className="apod-image"
                                    />
                                ) : (
                                    <iframe
                                        title="apod-video"
                                        src={apodData.url}
                                        frameBorder="0"
                                        allow="encrypted-media; fullscreen;" // Added fullscreen
                                        allowFullScreen
                                        className="apod-video"
                                    ></iframe>
                                )}
                            </div>

                            <div className="apod-info">
                                <h2 className="apod-title">{apodData.title}</h2>
                                <p className="apod-description">{apodData.explanation}</p>
                                {apodData.copyright && (
                                    <p className="apod-copyright">Copyright: {apodData.copyright}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default AstronomyPictureOfDay;