import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AttendeeDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ registered_events: 0, upcoming_events: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/analytics/attendee/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch attendee stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <Container className="mt-4">
            <h2 style={{ color: 'var(--dark)', marginBottom: '1.5rem' }}>Welcome Back!</h2>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <Card className="shadow-sm flex-fill dashboard-stat-card animate-slide-up hover-lift" style={{ borderRadius: '15px', background: '#E3F2FD', border: 'none', animationDelay: '0.1s' }}>
                    <Card.Body className="d-flex align-items-center justify-content-between p-4">
                        <div>
                            <h2 style={{ color: '#1976D2', marginBottom: 0 }}>{loading ? '-' : stats.upcoming_events}</h2>
                            <p style={{ margin: 0, color: 'var(--text)' }}>Upcoming Events</p>
                        </div>
                        <span style={{ fontSize: '2rem' }}>📅</span>
                    </Card.Body>
                </Card>

                <Card className="shadow-sm flex-fill dashboard-stat-card animate-slide-up hover-lift" style={{ borderRadius: '15px', background: '#F3E5F5', border: 'none', animationDelay: '0.2s' }}>
                    <Card.Body className="d-flex align-items-center justify-content-between p-4">
                        <div>
                            <h2 style={{ color: '#7B1FA2', marginBottom: 0 }}>{loading ? '-' : stats.registered_events}</h2>
                            <p style={{ margin: 0, color: 'var(--text)' }}>Total Registrations</p>
                        </div>
                        <span style={{ fontSize: '2rem' }}>🎟️</span>
                    </Card.Body>
                </Card>
            </div>

            <Row>
                <Col md={6} className="mb-3">
                    <Card className="h-100 dashboard-section-card animate-slide-up hover-lift" style={{ border: 'none', borderRadius: '15px', animationDelay: '0.3s' }}>
                        <Card.Body className="text-center p-5">
                            <h3>Ready to explore?</h3>
                            <p>Discover workshops, seminars, and networking events happening around you.</p>
                            <Button variant="primary" size="lg" onClick={() => navigate('/events')} style={{ borderRadius: '50px', padding: '10px 30px' }}>Browse Events</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mb-3">
                    <Card className="h-100 dashboard-section-card animate-slide-up hover-lift" style={{ border: 'none', borderRadius: '15px', animationDelay: '0.4s' }}>
                        <Card.Body className="text-center p-5">
                            <h3>Your Tickets</h3>
                            <p>Access your QR codes for easy check-in at the venue.</p>
                            <Button variant="outline-dark" size="lg" onClick={() => navigate('/my-ticket')} style={{ borderRadius: '50px', padding: '10px 30px' }}>View My Tickets</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AttendeeDashboard;
