
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Registrations = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_created: 0,
        total_registrations: 0,
        total_checkins: 0,
        popular_event: '',
        registrations_by_event: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            try {
                // Re-using the organizer analytics endpoint as it has exactly what we need:
                // per-event ticket counts. For "check-ins" per event, we might need to enhance the backend 
                // or just rely on the aggregations we already have if the backend supports it.
                // Currently backend sends 'ticket_count' (total). 
                // Let's check backend analytics/views.py again -> it sends 'registrations_by_event' with 'ticket_count'.
                // It does NOT send check-in count PER EVENT. 
                // We should update backend to include check-in count per event.

                const response = await axios.get('http://127.0.0.1:8000/api/analytics/organizer/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch organizer stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <Container className="mt-4">
            <h2 style={{ color: 'var(--dark)', marginBottom: '2rem' }}>Event Registrations & Check-ins</h2>

            {loading ? <p>Loading...</p> : (
                <div className="table-responsive shadow-sm" style={{ background: 'var(--card)', borderRadius: '15px', padding: '1rem' }}>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Event Title</th>
                                <th>Total Registrations</th>
                                <th>Check-ins</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.registrations_by_event && stats.registrations_by_event.length > 0 ? (
                                stats.registrations_by_event.map((event) => (
                                    <tr key={event.id}>
                                        <td style={{ fontWeight: '500' }}>{event.title}</td>
                                        <td>
                                            <Badge bg="primary">{event.ticket_count}</Badge>
                                        </td>
                                        <td>
                                            {/* Backend needs update to send checkin_count per event */}
                                            <Badge bg="success">{event.checkin_count || 0}</Badge>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => navigate(`/event/${event.id}/attendees`)}
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">No events found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default Registrations;
