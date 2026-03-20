import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/events/my-events/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setEvents(response.data);
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel (delete) this event? This action cannot be undone.")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/events/${id}/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setEvents(events.filter(e => e.id !== id));
            toast.success("Event successfully deleted.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete event.");
        }
    };

    const handleComplete = async (id) => {
        if (!window.confirm("Are you sure you want to mark this event as completed? This will enable the Memory Book.")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://127.0.0.1:8000/api/events/complete/${id}/`, {}, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setEvents(events.map(e => e.id === id ? { ...e, status: 'completed' } : e));
            toast.success("Event marked as completed!");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to mark event as completed.");
        }
    };

    if (loading) return <div>Loading Events...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--dark)' }}>My Posted Events</h1>
                <Link to="/dashboard/organizer/create-event" className="btn-action" style={{ background: 'var(--primary)', padding: '0.8rem 1.5rem', fontSize: '1rem', textDecoration: 'none', color: 'white' }}>+ Create New Event</Link>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {events.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ background: 'var(--card)', padding: '3rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', border: '1px solid var(--border)' }}>
                            <div style={{
                                width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2.5rem', margin: '0 auto 1.5rem auto'
                            }}>
                                <FaCalendarPlus />
                            </div>
                            <h2 style={{ color: 'var(--dark)', marginBottom: '1rem', fontWeight: '700' }}>No Events Posted</h2>
                            <p style={{ color: 'var(--text)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                Your organizer dashboard is looking a little empty! Create your first event to start accepting registrations and generating beautiful analytics.
                            </p>
                            <Link to="/create-event" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem', borderRadius: '50px', fontWeight: '600' }}>
                                Create Your First Event
                            </Link>
                        </div>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="approval-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', background: 'var(--card)', padding: '1.5rem', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                            {/* Event Poster Thumbnail */}
                            <div style={{
                                width: '120px',
                                height: '120px',
                                background: event.image ? `url(${event.image.startsWith('http') ? event.image : 'http://127.0.0.1:8000' + event.image})` : '#eee',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '10px'
                            }}></div>

                            {/* Event Details */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ color: 'var(--dark)', marginBottom: '0.5rem', margin: 0 }}>{event.title}</h3>
                                    <span style={{
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                        fontSize: '0.8rem',
                                        background: event.status === 'approved' ? '#E8F5E9' : event.status === 'rejected' ? '#FFEBEE' : '#FFF3E0',
                                        color: event.status === 'approved' ? '#2E7D32' : event.status === 'rejected' ? '#C62828' : '#EF6C00',
                                        textTransform: 'capitalize'
                                    }}>
                                        {event.status}
                                    </span>
                                </div>

                                <p style={{ color: 'var(--text)', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                                    📅 {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | 📍 {event.venue}
                                </p>

                                <div style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '0.9rem' }}>
                                    <span>👥 <strong>{event.capacity}</strong> Capacity</span>
                                </div>

                                {event.status === 'rejected' && event.rejection_reason && (
                                    <div style={{ color: '#C62828', fontSize: '0.9rem', background: '#FFEBEE', padding: '8px', borderRadius: '4px', marginBottom: '1rem' }}>
                                        <strong>Rejection Reason:</strong> {event.rejection_reason}
                                    </div>
                                )}

                                {/* Actions Toolbar */}
                                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                    {/* <button onClick={() => navigate(`/event-details/${event.id}`)} className="btn-action" style={{ background: '#2196F3' }}>View Details</button> */}

                                    {/* {event.status === 'pending' && (
                                        <button className="btn-action" style={{ background: '#FF9800' }}>✏️ Edit</button>
                                    )} */}

                                    {event.status === 'approved' && (
                                        <button onClick={() => handleComplete(event.id)} className="btn-action" style={{ background: '#4CAF50' }}>✅ Mark Completed</button>
                                    )}

                                    {event.status === 'completed' && (
                                        <>
                                            <button onClick={() => navigate(`/memory-book/${event.id}`)} className="btn-action" style={{ background: '#E91E63' }}>📸 Memory Book</button>
                                        </>
                                    )}

                                    {event.status !== 'approved' && event.status !== 'completed' && event.status !== 'cancelled' && (
                                        <button onClick={() => handleCancel(event.id)} className="btn-action" style={{ background: '#F44336' }}>🚫 Cancel/Delete</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyEvents;
