import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const BrowseEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('upcoming');
    const [visibilityFilter, setVisibilityFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    useEffect(() => {
        fetchEvents();
    }, [search, category, sort]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Build Query params
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category && category !== 'All') params.append('category', category);
            if (sort) params.append('sort', sort);
            if (visibilityFilter) params.append('visibility', visibilityFilter);

            const headers = {};
            if (isAuthenticated) {
                const token = localStorage.getItem('token');
                if (token) headers['Authorization'] = `Token ${token}`;
            }

            const response = await axios.get(`http://127.0.0.1:8000/api/events/public/?${params.toString()}`, { headers });
            setEvents(response.data);
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="browse-events-wrapper" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', color: 'var(--dark)' }}>Check out Upcoming Events!</h1>

            {/* Filter Bar */}
            <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', background: 'var(--card)', padding: '1rem', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <input
                    type="text"
                    placeholder="Search event, venue..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd' }}
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd' }}
                >
                    <option value="All">All Categories</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Concert">Concert</option>
                    <option value="Exhibition">Exhibition</option>
                </select>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd' }}
                >
                    <option value="upcoming">Upcoming Date</option>
                    <option value="newest">Recently Posted</option>
                </select>

                {isAuthenticated && (
                    <select
                        value={visibilityFilter}
                        onChange={(e) => setVisibilityFilter(e.target.value)}
                        style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}
                    >
                        <option value="">All Available</option>
                        <option value="COLLEGE">My College Events</option>
                    </select>
                )}

                {/* <button className="filter-btn" onClick={fetchEvents} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '10px', cursor: 'pointer' }}>Search</button> */}
            </div>

            {loading ? (
                <div className="events-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{ background: 'var(--card)', borderRadius: '15px', overflow: 'hidden', padding: '1rem', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            <Skeleton height={150} style={{ borderRadius: '10px', marginBottom: '1rem' }} baseColor="var(--background)" highlightColor="var(--border)" />
                            <Skeleton count={1} height={20} width="80%" style={{ marginBottom: '0.5rem' }} baseColor="var(--background)" highlightColor="var(--border)" />
                            <Skeleton count={2} height={15} baseColor="var(--background)" highlightColor="var(--border)" style={{ marginBottom: '0.2rem' }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="events-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {events.length === 0 ? <p>No events found.</p> : events.map(event => (
                        <div key={event.id} className="event-card" onClick={() => navigate(`/event-details/${event.id}`)} style={{ background: 'var(--card)', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div className="card-img" style={{
                                height: '180px',
                                background: event.image ? `url(${event.image.startsWith('http') ? event.image : 'http://127.0.0.1:8000' + event.image})` : 'var(--primary)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                padding: '1rem'
                            }}>
                                <span style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', height: 'fit-content' }}>{event.category}</span>
                                {event.visibility === 'COLLEGE' && (
                                    <span style={{ background: '#ff4c4c', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>🎓 College Only</span>
                                )}
                            </div>
                            <div className="card-body" style={{ padding: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{event.title}</h3>
                                <p style={{ color: 'var(--text)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📅 {new Date(event.date).toLocaleDateString()}</p>
                                <p style={{ color: 'var(--text)', fontSize: '0.85rem' }}>📍 {event.venue}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseEvents;
