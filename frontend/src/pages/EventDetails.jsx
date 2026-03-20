import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Token ${token}` } : {};
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/events/${id}/`, { headers });
            setEvent(response.data);
        } catch (err) {
            console.error("Failed to fetch event details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        const token = localStorage.getItem('token');
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (!token || !isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!window.confirm(`Confirm registration for ${event.title}?`)) return;

        setRegistering(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/tickets/book/',
                { event: event.id },
                { headers: { 'Authorization': `Token ${token}` } }
            );
            toast.success('Registration Successful! Redirecting to your ticket...');
            setTimeout(() => navigate('/my-ticket'), 1000);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Registration failed.");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Event Details...</div>;
    if (!event) return <div style={{ padding: '2rem' }}>Event not found.</div>;

    const isSoldOut = event.seats_left === 0;
    const isRegistered = event.is_registered;
    const isPastEvent = new Date(event.date) < new Date();

    const imageUrl = event.image ? (event.image.startsWith('http') ? event.image : 'http://127.0.0.1:8000' + event.image) : '';

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '4rem', paddingTop: '80px' }}>
            {/* Massive Parallax Hero */}
            <div style={{
                minHeight: '70vh',
                width: '100%',
                position: 'relative',
                backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                backgroundColor: 'var(--primary)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '4rem 1rem'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.95))',
                    zIndex: 1
                }}></div>
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white', padding: '0 20px', animation: 'fadeInUp 1s ease', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(12px)',
                        padding: '3rem 3rem',
                        borderRadius: '30px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        maxWidth: '900px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', display: 'inline-block', letterSpacing: '1px', textTransform: 'uppercase' }}>{event.category}</span>

                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, margin: 0, lineHeight: 1.2, textShadow: '0 4px 15px rgba(0,0,0,0.5)', color: '#ffffff' }}>{event.title}</h1>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', alignItems: 'center', fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', fontWeight: 500, margin: 0, color: 'rgba(255, 255, 255, 0.95)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}><span style={{ marginRight: '10px', fontSize: '1.2em' }}>📅</span>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="d-none d-md-inline" style={{ opacity: 0.5 }}>|</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}><span style={{ marginRight: '10px', fontSize: '1.2em' }}>📍</span>{event.venue}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Container style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
                <div className="animate-slide-up" style={{
                    background: 'var(--card)',
                    borderRadius: '24px',
                    padding: '3rem',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    marginBottom: '2rem'
                }}>

                    <Row>
                        <Col md={8}>
                            <h3>About Event</h3>
                            <p style={{ color: 'var(--text)', marginTop: '1rem', lineHeight: '1.7', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                                {event.description}
                            </p>

                            <h4 style={{ marginTop: '2rem' }}>Organizer</h4>
                            <p style={{ color: 'var(--text)' }}>Hosted by: <strong>{event.organizer_name}</strong></p>

                            <div className="map-placeholder" style={{ marginTop: '2rem', background: 'var(--background)', height: '250px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', border: '1px dashed var(--border)' }}>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0, borderRadius: '10px' }}
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(event.venue)}&output=embed`}
                                    allowFullScreen
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </Col>

                        <Col md={4}>
                            <div className="registration-box" style={{ background: 'var(--background)', padding: '2rem', borderRadius: '15px', textAlign: 'center', border: '1px solid var(--border)', position: 'sticky', top: '20px' }}>
                                <p style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>Seat Availability</p>
                                <h2 style={{ color: isSoldOut ? '#F44336' : '#2c3e50', margin: '0 0 1.5rem 0' }}>
                                    {isSoldOut ? 'SOLD OUT' : `${event.seats_left} / ${event.capacity} LEFT`}
                                </h2>

                                {event.status === 'completed' ? (
                                    <Button
                                        variant="info"
                                        size="lg"
                                        onClick={() => navigate(`/memory-book/${event.id}`)}
                                        style={{ width: '100%', borderRadius: '50px', background: 'linear-gradient(45deg, #00c6ff, #0072ff)', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(0, 198, 255, 0.4)' }}
                                    >
                                        ✨ View Memory Book
                                    </Button>
                                ) : isRegistered ? (
                                    <Button variant="success" size="lg" disabled style={{ width: '100%', borderRadius: '50px' }}>
                                        ✅ Already Registered
                                    </Button>
                                ) : isSoldOut ? (
                                    <Button variant="secondary" size="lg" disabled style={{ width: '100%', borderRadius: '50px' }}>
                                        🚫 Sold Out
                                    </Button>
                                ) : isPastEvent ? (
                                    <Button variant="secondary" size="lg" disabled style={{ width: '100%', borderRadius: '50px' }}>
                                        Event Ended
                                    </Button>
                                ) : localStorage.getItem('isAuthenticated') ? (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={handleRegister}
                                        disabled={registering}
                                        style={{ width: '100%', borderRadius: '50px' }}
                                    >
                                        {registering ? 'Booking...' : 'Register Now'}
                                    </Button>
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#e74c3c', fontWeight: '500', marginBottom: '1rem' }}>
                                            <i className="bi bi-lock-fill me-1"></i>
                                            Guests cannot register for events.
                                        </p>
                                        <Button
                                            variant="outline-primary"
                                            size="lg"
                                            onClick={() => navigate('/login')}
                                            style={{ width: '100%', borderRadius: '50px' }}
                                        >
                                            Log In to Register
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default EventDetails;
