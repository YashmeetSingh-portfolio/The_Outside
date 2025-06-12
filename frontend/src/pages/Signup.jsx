import React from 'react';
import {Link} from 'react-router-dom';
import '../styles/Auth.css';

function Signup() {
    return (
        <div className="auth-container">
            <div className="stars-background">
                <div className="stars"></div>
                <div className="stars2"></div>
                <div className="stars3"></div>
            </div>

            <div className="glass-card">
                <h1 className="auth-title">Join The Outside</h1>
                <p className="auth-subtitle">Create your account and start exploring</p>

                <form className="auth-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="auth-input"
                            required
                        />
                    </div>

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

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="auth-input"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button">Sign Up</button>
                </form>

                <p className="auth-redirect">
                    Already have an account? <Link to="/login" className="auth-link">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;