import React from 'react';

const Terms = () => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '4rem auto',
            padding: '2rem',
            background: 'var(--card)',
            borderRadius: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
        }}>
            <h1 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Terms & Conditions</h1>
            <ul style={{ color: 'var(--text)', fontSize: '1.1rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '1rem' }}>Users must provide accurate information while registering.</li>
                <li style={{ marginBottom: '1rem' }}>Organizers are responsible for the content and management of their events.</li>
                <li style={{ marginBottom: '1rem' }}>Admin reserves the right to approve, reject, or remove events violating platform policies.</li>
            </ul>
        </div>
    );
};

export default Terms;
