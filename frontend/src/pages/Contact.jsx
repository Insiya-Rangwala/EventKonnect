import React, { useState } from 'react';

const Contact = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Message sent successfully!");
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '4rem auto',
            padding: '2rem',
            background: 'var(--card)',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(255, 107, 53, 0.2)'
        }}>
            <h1 style={{ color: 'var(--dark)', marginBottom: '2rem' }}>Contact Us</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--dark)', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                    <input type="text" placeholder="Your name" required style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '2px solid #f0f0f0',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontFamily: 'inherit'
                    }} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--dark)', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                    <input type="email" placeholder="your@email.com" required style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '2px solid #f0f0f0',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontFamily: 'inherit'
                    }} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--dark)', marginBottom: '0.5rem', fontWeight: 500 }}>Subject</label>
                    <input type="text" placeholder="How can we help?" required style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '2px solid #f0f0f0',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontFamily: 'inherit'
                    }} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--dark)', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
                    <textarea rows="5" placeholder="Your message..." required style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '2px solid #f0f0f0',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontFamily: 'inherit'
                    }} onChange={(e) => setForm({ ...form, message: e.target.value })}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
            </form>
            <div className="contact-info" style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text)' }}>
                <p>Or reach us at: <strong>support@eventkonnect.com</strong></p>
                <p style={{ marginTop: '1rem' }}>📞 +91 98765 43210</p>
            </div>
        </div>
    );
};

export default Contact;
