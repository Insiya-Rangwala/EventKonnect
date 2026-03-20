import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Using standard Django URL
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/forgot-password/`, { email });
            // For security, checking user existence should be silent, so we show success regardless
            setSubmitted(true);
        } catch (err) {
            console.error("Forgot Password error", err);
            // Even on error, usually good security practice to say "If email exists..." or generic error
            setSubmitted(true);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--light)',
            padding: '2rem'
        }}>
            {/* Logo */}
            <Link to="/" style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--primary)',
                textDecoration: 'none',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                🎫 EventKonnect
            </Link>

            <div style={{
                background: 'var(--card)',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                width: '100%',
                maxWidth: '450px',
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--dark)' }}>Reset Password</h2>

                {!submitted ? (
                    <>
                        <p style={{ color: 'var(--text)', marginBottom: '2rem' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <label
                                    htmlFor="email"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '500',
                                        color: 'var(--dark)'
                                    }}
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter your email"
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    fontSize: '1rem',
                                    marginBottom: '1.5rem'
                                }}
                            >
                                Send Reset Link
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Check your mail</h3>
                        <p style={{ color: 'var(--text)' }}>
                            We have sent a password recover instructions to your email.
                        </p>
                    </div>
                )}

                <Link
                    to="/login"
                    style={{
                        color: 'var(--text)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '500'
                    }}
                >
                    ← Back to Login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
