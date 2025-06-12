import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="stars-background">
                <div className="stars"></div>
                <div className="stars2"></div>
                <div className="stars3"></div>
            </div>

            <div className="glass-card">
                <h1 className="auth-title">Welcome Back to The Outside</h1>
                <p className="auth-subtitle">Log in to explore the universe</p>

                <form className="auth-form">
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            className="auth-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            className="auth-input"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button"
                            onClick={() => navigate('/')}
                    >Login
                    </button>

                    <div className="auth-links">
                        <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                    </div>
                </form>

                <p className="auth-redirect">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
