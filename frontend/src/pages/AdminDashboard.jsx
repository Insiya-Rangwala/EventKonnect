import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_users: 0, total_events: 0, pending_approvals: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/analytics/admin/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <Container className="mt-4">
            <h2 style={{ color: 'var(--dark)', marginBottom: '2rem' }}>Admin Dashboard</h2>
            <Row className="mt-4">
                <Col md={4}>
                    <Card className="mb-4 dashboard-stat-card animate-slide-up hover-lift" style={{ border: 'none', borderRadius: '15px', animationDelay: '0.1s' }}>
                        <Card.Body style={{ textAlign: 'center', padding: '2rem' }}>
                            <h1 style={{ color: '#2196F3', fontSize: '3rem' }}>{loading ? '-' : stats.total_users}</h1>
                            <Card.Title>Total Users</Card.Title>
                            <Button variant="outline-primary" onClick={() => navigate('/manage-users')} style={{ marginTop: '1rem' }}>Manage Users</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4 dashboard-stat-card animate-slide-up hover-lift" style={{ border: 'none', borderRadius: '15px', animationDelay: '0.2s' }}>
                        <Card.Body style={{ textAlign: 'center', padding: '2rem' }}>
                            <h1 style={{ color: '#FF9800', fontSize: '3rem' }}>{loading ? '-' : stats.pending_approvals}</h1>
                            <Card.Title>Pending Approvals</Card.Title>
                            <Button variant="outline-warning" onClick={() => navigate('/approve-events')} style={{ marginTop: '1rem' }}>Review Events</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4 dashboard-stat-card animate-slide-up hover-lift" style={{ border: 'none', borderRadius: '15px', animationDelay: '0.3s' }}>
                        <Card.Body style={{ textAlign: 'center', padding: '2rem' }}>
                            <h1 style={{ color: '#4CAF50', fontSize: '3rem' }}>{loading ? '-' : stats.total_events}</h1>
                            <Card.Title>Total Events</Card.Title>
                            <Button variant="outline-success" onClick={() => navigate('/dashboard/admin/events')} style={{ marginTop: '1rem' }}>View All Events</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions Row */}
            <Row className="mt-4">
                <Col md={6}>
                    <Card className="p-4 dashboard-section-card animate-slide-up hover-lift" style={{ animationDelay: '0.4s' }}>
                        <h4>Platform Health</h4>
                        <p>System is running smoothly. Last backup: Today 4:00 AM.</p>
                        <Button variant="dark" onClick={() => navigate('/dashboard/admin/reports')}>View Reports</Button>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboard;
