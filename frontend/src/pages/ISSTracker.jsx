import React, {useEffect, useState} from 'react';
import {MapContainer, TileLayer, Marker, Popup, useMap} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ISSTracker.css';
import Navbar from '../components/Navbar';

// Custom ISS glowing icon
const ISS_ICON = new L.DivIcon({
    html: `
    <div style="
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: radial-gradient(circle at center, #ffffff, #00bfff);
      box-shadow: 0 0 20px 8px rgba(0, 191, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: bold;
      color: black;
    ">
      🛰️
    </div>
  `,
    className: '',
    iconSize: [60, 60],
    iconAnchor: [30, 30],
});

// Component to keep the map centered on ISS
function MapUpdater({position}) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom(), {
                animate: true,
                duration: 1.5,
            });
        }
    }, [position, map]);

    return null;
}

function ISSTracker() {
    const [position, setPosition] = useState([0, 0]);
    const [details, setDetails] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchISS = async () => {
            try {
                const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
                const data = await res.json();
                setPosition([data.latitude, data.longitude]);
                setDetails(data);
                setIsUpdating(true);
                setTimeout(() => setIsUpdating(false), 500);
            } catch (error) {
                console.error("Error fetching ISS data:", error);
            }
        };

        fetchISS();
        const interval = setInterval(fetchISS, 5000);
        return () => clearInterval(interval);
    }, []);

    const DataValue = ({value, unit = ''}) => (
        <span className={`iss-data-value ${isUpdating ? 'data-update' : ''}`}>
            {value}{unit}
        </span>
    );

    return (
        <>
            <Navbar/>
            <div className="iss-container">
                <div className="iss-map">
                    <MapContainer
                        center={position}
                        zoom={3}
                        scrollWheelZoom={true}
                        style={{height: '100%', width: '100%'}}
                    >
                        <MapUpdater position={position}/>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                        <Marker position={position} icon={ISS_ICON}>
                            <Popup>
                                <strong>ISS Location</strong><br/>
                                🌍 Lat: {position[0].toFixed(2)}°<br/>
                                🌐 Lon: {position[1].toFixed(2)}°<br/>
                                🛸 Alt: {details?.altitude.toFixed(2)} km<br/>
                                ⚡️ Speed: {details?.velocity.toFixed(2)} km/h
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>

                <div className="iss-info-panel">
                    <h2>🛸 ISS Live Tracker</h2>
                    <div className="iss-description">
                        Monitoring the International Space Station as it orbits Earth at approximately
                        28,000 km/h, completing a full orbit every ~90 minutes.
                    </div>

                    <h3>📡 Real-Time Data</h3>
                    <ul>
                        <li>
                            <strong>Latitude</strong>
                            <DataValue value={position[0].toFixed(2)} unit="°"/>
                        </li>
                        <li>
                            <strong>Longitude</strong>
                            <DataValue value={position[1].toFixed(2)} unit="°"/>
                        </li>
                        <li>
                            <strong>Altitude</strong>
                            <DataValue value={details?.altitude.toFixed(2)} unit=" km"/>
                        </li>
                        <li>
                            <strong>Velocity</strong>
                            <DataValue value={details?.velocity.toFixed(2)} unit=" km/h"/>
                        </li>
                    </ul>

                    <h3>🌠 Mission Info</h3>
                    <div className="iss-description">
                        The ISS represents humanity's largest space laboratory, a joint venture between
                        NASA, Roscosmos, JAXA, ESA, and CSA. It serves as a unique microgravity and
                        space environment research laboratory.
                    </div>
                </div>
            </div>
        </>
    );
}

export default ISSTracker;