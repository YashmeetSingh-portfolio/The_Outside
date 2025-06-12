import React, {useState} from 'react';
import '../styles/solarSytem.css';
import Navbar from '../components/Navbar';

function ExploreSolarSystem() {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <>
            <Navbar/>
            <div className="explore-container">
                <h1 className="explore-title"> Explore the Solar System</h1>

                {!isLoaded && (
                    <div className="explore-loader">
                        <div className="loader-circle"></div>
                    </div>
                )}

                <iframe
                    src="https://eyes.nasa.gov/apps/solar-system/#/home"
                    allowFullScreen
                    onLoad={() => setIsLoaded(true)}
                    title="NASA Solar System Explorer"
                    className="explore-iframe"
                ></iframe>
            </div>
        </>
    );
}

export default ExploreSolarSystem;
