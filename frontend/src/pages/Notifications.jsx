import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/core/notifications/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setNotifications(response.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/core/notifications/mark-all-read/`, {}, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const markRead = async (id, isRead) => {
        if (isRead) return;
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/core/notifications/${id}/read/`, {}, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'info': return 'ℹ️';
            case 'success': return '✅';
            case 'alert': return '⚠️';
            default: return '🔔';
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ color: 'var(--dark)' }}>Notifications ({notifications.filter(n => !n.is_read).length})</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={markAllRead} style={{ padding: '0.5rem 1rem', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Mark all read</button>
                    <button onClick={fetchNotifications} style={{ padding: '0.5rem 1rem', background: '#9E9E9E', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Refresh</button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {loading ? <p>Loading...</p> : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text)', background: 'var(--card)', borderRadius: '10px' }}>
                        <h3>No new notifications</h3>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => markRead(n.id, n.is_read)}
                            style={{
                                background: n.is_read ? '#f9f9f9' : 'white',
                                borderLeft: `5px solid ${n.type === 'alert' ? '#ff9800' : n.type === 'success' ? '#4caf50' : '#2196f3'}`,
                                padding: '1.2rem',
                                borderRadius: '10px',
                                boxShadow: n.is_read ? 'none' : '0 4px 15px rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                cursor: n.is_read ? 'default' : 'pointer',
                                transition: '0.2s',
                                opacity: n.is_read ? 0.7 : 1
                            }}
                        >
                            <div style={{ fontSize: '1.5rem' }}>{getIcon(n.type)}</div>
                            <div style={{ flex: 1 }}>
                                <h5 style={{ margin: 0, fontWeight: n.is_read ? 'normal' : 'bold', color: '#333' }}>{n.title}</h5>
                                <p style={{ margin: '0.2rem 0', color: 'var(--text)' }}>{n.message}</p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>{n.timestamp}</span>
                            </div>
                            {!n.is_read && <div style={{ width: '10px', height: '10px', backgroundColor: '#FF5722', borderRadius: '50%' }}></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
