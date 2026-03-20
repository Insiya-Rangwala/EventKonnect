import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '4rem auto',
            padding: '2rem',
            background: 'var(--card)',
            borderRadius: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
        }}>
            <h1 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>About EventKonnect</h1>
            <p style={{ marginBottom: '1rem', color: 'var(--text)' }}>
                EventKonnect is a Smart Event Management System designed to simplify event creation, management, and participation.
            </p>
            <p style={{ marginBottom: '1rem', color: 'var(--text)' }}>
                It supports Admin, Organizer, and Attendee roles with secure, role-based access control.
            </p>

            <h3 style={{ color: 'var(--dark)' }}>Our Mission</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text)' }}>
                To make event management seamless, transparent, and efficient.
            </p>

            <div className="feature-list" style={{ margin: '2rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="feature-item" style={{ background: 'var(--light)', padding: '1.5rem', borderRadius: '15px', borderLeft: '5px solid var(--primary)' }}>
                    <strong style={{ color: 'var(--dark)' }}>QR Ticketing</strong>
                    <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--text)' }}>Server-side validated entries for secure campus access.</p>
                </div>
                <div className="feature-item" style={{ background: 'var(--light)', padding: '1.5rem', borderRadius: '15px', borderLeft: '5px solid var(--primary)' }}>
                    <strong style={{ color: 'var(--dark)' }}>College Mode</strong>
                    <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--text)' }}>Restricted event access with manual student verification.</p>
                </div>
                <div className="feature-item" style={{ background: 'var(--light)', padding: '1.5rem', borderRadius: '15px', borderLeft: '5px solid var(--primary)' }}>
                    <strong style={{ color: 'var(--dark)' }}>AI Chatbot</strong>
                    <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--text)' }}>24/7 guidance for event discovery and registration help.</p>
                </div>
                <div className="feature-item" style={{ background: 'var(--light)', padding: '1.5rem', borderRadius: '15px', borderLeft: '5px solid var(--primary)' }}>
                    <strong style={{ color: 'var(--dark)' }}>Memory Book</strong>
                    <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--text)' }}>Preserving event highlights through photos and attendee notes.</p>
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>← Back to Home</Link>
            </div>
        </div>
    );
};

export default About;
