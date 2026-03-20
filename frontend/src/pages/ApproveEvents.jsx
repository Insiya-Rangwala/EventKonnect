
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApproveEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/events/all/`, {
                headers: { Authorization: `Token ${token}` }
            });
            // Filter only pending events
            const pendingEvents = response.data.filter(event => event.status === 'pending');
            setEvents(pendingEvents);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch events');
            setLoading(false);
        }
    };

    const handleAction = async (eventId, action) => {
        let reason = '';
        if (action === 'reject') {
            reason = prompt('Enter rejection reason:');
            if (reason === null) return; // Cancelled
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/events/approve/${eventId}/`,
                { action, reason },
                { headers: { Authorization: `Token ${token}` } }
            );
            fetchEvents(); // Refresh list
        } catch (err) {
            alert('Failed to update event status');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Pending Event Approvals</h1>
            <div style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem' }}>
                {events.length === 0 ? (
                    <p>No pending events.</p>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="approval-card" style={{
                            background: 'var(--card)',
                            padding: '1.5rem',
                            borderRadius: '10px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div className="event-info">
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{event.title}</h3>
                                <p style={{ color: 'var(--text)' }}>
                                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()} |
                                    <strong> Category:</strong> {event.category}
                                </p>
                                <p style={{ color: 'var(--text)' }}>
                                    <strong>Venue:</strong> {event.venue} |
                                    <strong> Capacity:</strong> {event.capacity}
                                </p>
                                <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"{event.description}"</p>
                            </div>
                            <div className="actions" style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => handleAction(event.id, 'approve')}
                                    className="btn"
                                    style={{ background: '#28a745', color: 'white' }}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(event.id, 'reject')}
                                    className="btn"
                                    style={{ background: '#dc3545', color: 'white' }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ApproveEvents;
