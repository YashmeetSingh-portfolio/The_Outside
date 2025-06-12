import {useState, useEffect} from 'react';
import './comp_styles/Navbar.css';
import {Link, useNavigate} from 'react-router-dom';


const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Toggle mobile menu
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo and brand name */}
                <div className="navbar-logo" onClick={() => {
                    navigate('/')
                }} style={{cursor: 'pointer'}}>
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                fill="currentColor"/>
                        </svg>
                    </div>
                    <span className="brand-name">The Outside</span>
                </div>

                {/* Desktop Navigation */}
                <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
                    <ul>
                        <li><Link to="/">Home</Link></li>

                        {/* Explore Dropdown */}
                        <li className="dropdown">
                            <a href="#explore">Explore <span className="dropdown-arrow">▼</span></a>
                            <ul className="dropdown-menu">
                                <li><Link to="/solarSystem">Solar System</Link></li>

                                <li><Link to="/ISSTracking">ISS Tracker</Link></li>
                                <li><Link to="/apod">Astronomy Picture of The Day</Link></li>
                            </ul>
                        </li>

                        {/* Learn Dropdown */}
                        <li className="dropdown">
                            <a href="#learn">Learn <span className="dropdown-arrow">▼</span></a>
                            <ul className="dropdown-menu">
                                <li><Link to="/spacefacts">AI Facts</Link></li>
                                <li><Link to="/spacequiz">AI Quiz</Link></li>
                                <li><Link to="/askdoubt">AI Doubt Solving</Link></li>
                            </ul>
                        </li>
                    </ul>
                </div>

                {/* CTA Button */}
                <div className="navbar-cta">
                    <button className="cta-button"
                            onClick={() => {
                                if (isLoggedIn) {
                                    navigate('/dashboard');
                                } else {
                                    navigate('/login');
                                }
                            }}
                    >Explore Now
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="mobile-menu-toggle" onClick={toggleMenu}>
                    <div className={`hamburger ${isOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;