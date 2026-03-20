import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Feedback = () => {
    // This could be a standalone page or a component. Making it a page for now to list pending feedbacks.
    // Ideally, feedback is given on the Event Details page or a list of "Past Events".

    // For demo purposes, let's make this page list "Events to Review"
    const [eventsToReview, setEventsToReview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ rating: 5, comment: '', eventId: null });

    useEffect(() => {
        fetchEventsToReview();
    }, []);

    const fetchEventsToReview = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // Fetch user's tickets to find attended events
            // In a real app, backend should provide a "pending_feedback" endpoint
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tickets/my-tickets/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            // Filter tickets that are not cancelled (and optionally 'used' if we enforce check-in)
            const tickets = response.data.filter(t => t.status !== 'cancelled');
            setEventsToReview(tickets);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!formData.eventId) return;

        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/feedback/create/`,
                {
                    event: formData.eventId,
                    rating: formData.rating,
                    comment: formData.comment
                },
                { headers: { 'Authorization': `Token ${token}` } }
            );
            alert("Thank you for your feedback!");
            setFormData({ rating: 5, comment: '', eventId: null }); // Reset
            // Ideally remove the event from the list or mark as done
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.[0] || "Failed to submit feedback. You may have already reviewed this event.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--dark)', marginBottom: '2rem' }}>Share Your Experience</h1>

            <div style={{ display: 'grid', gap: '2rem' }}>
                <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <h3>Submit Feedback</h3>
                    <p style={{ color: 'var(--text)' }}>Select an event you attended and let us know your thoughts.</p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Event</label>
                            <select
                                value={formData.eventId || ''}
                                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                required
                            >
                                <option value="" disabled>-- Choose an Event --</option>
                                {eventsToReview.map(t => (
                                    <option key={t.id} value={t.event}>{t.event_title || `Event #${t.event}`}</option>
                                    // Note: Ticket serializer should Ideally return event title
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Rating</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <label key={star} style={{ cursor: 'pointer', fontSize: '1.5rem', color: star <= formData.rating ? '#FFD700' : '#ddd' }}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={star}
                                            checked={formData.rating === star}
                                            onChange={() => setFormData({ ...formData, rating: star })}
                                            style={{ display: 'none' }}
                                        />
                                        ★
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Comments</label>
                            <textarea
                                rows="4"
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                placeholder="What did you like? What could be improved?"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            style={{ padding: '1rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Submit Review
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
