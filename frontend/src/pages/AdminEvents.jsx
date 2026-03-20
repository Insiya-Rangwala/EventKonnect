import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/events/all/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            const data = response.data;
            setEvents(data);

            // Calculate Stats
            setStats({
                total: data.length,
                approved: data.filter(e => e.status === 'approved').length,
                pending: data.filter(e => e.status === 'pending').length,
                rejected: data.filter(e => e.status === 'rejected').length,
            });
        } catch (err) {
            console.error("Failed to fetch admin events", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        let reason = '';
        if (action === 'reject') {
            reason = prompt("Enter rejection reason:");
            if (!reason && reason !== "") return; // Cancel if null, allow empty string? maybe enforce reason?
            if (!reason) {
                alert("Rejection reason is required.");
                return;
            }
        }

        const token = localStorage.getItem('token');
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/events/approve/${id}/`,
                { action, reason },
                { headers: { 'Authorization': `Token ${token}` } }
            );
            // Refresh list or update local state
            fetchEvents();
        } catch (err) {
            console.error(err);
            alert(`Failed to ${action} event.`);
        }
    };

    if (loading) return <div>Loading Admin Events...</div>;

    return (
        <div>
            <h1 style={{ color: 'var(--dark)', marginBottom: '1.5rem' }}>All Events (Admin)</h1>

            {/* Top Summary Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={cardStyle}><h3 style={{ color: 'var(--primary)' }}>{stats.total}</h3><p>Total Events</p></div>
                <div style={cardStyle}><h3 style={{ color: '#4CAF50' }}>{stats.approved}</h3><p>Approved</p></div>
                <div style={cardStyle}><h3 style={{ color: '#FF9800' }}>{stats.pending}</h3><p>Pending</p></div>
                <div style={cardStyle}><h3 style={{ color: '#F44336' }}>{stats.rejected}</h3><p>Rejected</p></div>
            </div>

            {/* Events Table */}
            <div className="user-table-container" style={{ overflowX: 'auto' }}>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Organizer</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => (
                            <tr key={event.id}>
                                <td style={{ fontWeight: 'bold' }}>{event.title}</td>
                                <td>{event.organizer_name}</td>
                                <td><span style={badgeStyle}>{event.category}</span></td>
                                <td>{new Date(event.date).toLocaleDateString()}</td>
                                <td>
                                    <span style={{
                                        ...statusStyle,
                                        background: event.status === 'approved' ? '#E8F5E9' : event.status === 'pending' ? '#FFF3E0' : '#FFEBEE',
                                        color: event.status === 'approved' ? '#2E7D32' : event.status === 'pending' ? '#EF6C00' : '#C62828'
                                    }}>
                                        {event.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {event.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleAction(event.id, 'approve')} className="btn-action" style={{ background: '#4CAF50' }}>Approve</button>
                                                <button onClick={() => handleAction(event.id, 'reject')} className="btn-action" style={{ background: '#F44336' }}>Reject</button>
                                            </>
                                        )}
                                        {event.status !== 'pending' && <span style={{ color: '#999', fontSize: '0.8rem' }}>No Actions</span>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const cardStyle = {
    background: 'var(--card)',
    padding: '1.5rem',
    borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    textAlign: 'center'
};

const badgeStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    background: '#f0f0f0',
    fontSize: '0.85rem'
};

const statusStyle = {
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    textTransform: 'capitalize'
};

export default AdminEvents;
