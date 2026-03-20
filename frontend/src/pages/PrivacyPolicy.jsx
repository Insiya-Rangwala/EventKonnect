import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '4rem auto',
            padding: '2rem',
            background: 'var(--card)',
            borderRadius: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
        }}>
            <h1 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Privacy Policy</h1>
            <p style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                EventKonnect collects user information such as name and email for authentication and event participation purposes.
            </p>
            <p style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                We do not share personal data with third parties. All data is securely stored and protected.
            </p>
        </div>
    );
};

export default PrivacyPolicy;
