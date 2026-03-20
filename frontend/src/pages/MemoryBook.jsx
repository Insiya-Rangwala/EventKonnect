import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';

const MemoryBook = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Upload State (Organizer)
    const [uploadImage, setUploadImage] = useState(null);
    const [uploadCaption, setUploadCaption] = useState('');
    const [uploading, setUploading] = useState(false);

    // Comment State (Attendee)
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    const isOwner = event?.organizer === parseInt(localStorage.getItem('userId')) || true; // MOCK for this logic, better to verify via token payload if possible, or backend check. We'll rely on backend 403s.

    useEffect(() => {
        fetchEventData();
    }, [id]);

    const fetchEventData = async () => {
        try {
            const headers = token ? { 'Authorization': `Token ${token}` } : {};
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/events/${id}/`, { headers });
            setEvent(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load memory book data", err);
            setError("Failed to load Memory Book. Please make sure the event exists.");
            setLoading(false);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadImage) return alert("Please select an image");

        const formData = new FormData();
        formData.append('event', id);
        formData.append('image', uploadImage);
        if (uploadCaption) formData.append('description', uploadCaption);

        setUploading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/events/memory/create/`, formData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadImage(null);
            setUploadCaption('');
            fetchEventData(); // Refresh to see new images
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "You do not have permission to upload photos for this event.");
        } finally {
            setUploading(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/events/memory/comment/`, {
                event: id,
                comment: commentText
            }, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setCommentText('');
            fetchEventData(); // Refresh to see new comment
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "You must be registered for this event to leave a comment.");
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!event) return null;

    if (event.status !== 'completed' && userRole !== 'admin' && userRole !== 'organizer') {
        return (
            <Container className="text-center mt-5">
                <Alert variant="warning">
                    <h3>Memory Book Unavailable</h3>
                    <p>The Memory Book for this event will become available once the event is marked as Completed.</p>
                </Alert>
                <Link to={`/event-details/${id}`} className="btn btn-primary mt-3">Back to Event</Link>
            </Container>
        )
    }

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '2rem 0' }}>
            <Container>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '3rem', background: 'var(--card)', padding: '3rem', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <Badge bg="info" className="mb-3 px-3 py-2" style={{ fontSize: '1rem', borderRadius: '50px' }}>Digital Memory Book</Badge>
                    <h1 style={{ fontWeight: '800', fontSize: '3rem', color: 'var(--dark)', letterSpacing: '-1px' }}>{event.title}</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text)', maxWidth: '800px', margin: '1rem auto' }}>
                        Hosted by {event.organizer_name} • {new Date(event.date).toLocaleDateString()}
                    </p>
                    <Link to={`/event-details/${id}`} className="btn btn-outline-secondary rounded-pill mt-2">View Original Event Details</Link>
                </div>

                <Row>
                    {/* Left Column: The Photo Album Grid */}
                    <Col lg={8}>
                        <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontWeight: '700', color: 'var(--dark)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                📸 Event Album
                            </h2>

                            {/* Organizer Upload Form */}
                            {userRole === 'organizer' && (
                                <Card style={{ border: '2px dashed #ddd', borderRadius: '15px', background: '#fafafa', marginBottom: '2rem' }}>
                                    <Card.Body>
                                        <h5 style={{ color: 'var(--dark)', fontWeight: 'bold' }}>Organizer Capabilities: Add a Memory</h5>
                                        <Form onSubmit={handleUploadSubmit}>
                                            <Row className="align-items-center">
                                                <Col md={5}>
                                                    <Form.Group>
                                                        <Form.Control
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setUploadImage(e.target.files[0])}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={5}>
                                                    <Form.Group>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Add a snappy caption..."
                                                            value={uploadCaption}
                                                            onChange={(e) => setUploadCaption(e.target.value)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Button type="submit" variant="primary" className="w-100 rounded-pill" disabled={uploading}>
                                                        {uploading ? '...' : 'Upload'}
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Album Grid */}
                            {event.memory_books && event.memory_books.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                    {event.memory_books.map(memory => (
                                        <div key={memory.id} style={{
                                            position: 'relative',
                                            borderRadius: '15px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                            aspectRatio: '1',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                        }} className="memory-card-hover">
                                            <img
                                                src={memory.image.startsWith('http') ? memory.image : `http://127.0.0.1:8000${memory.image}`}
                                                alt="Event Memory"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            {memory.description && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '0', left: '0', right: '0',
                                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                                    color: 'white',
                                                    padding: '2rem 1rem 1rem 1rem'
                                                }}>
                                                    <p style={{ margin: 0, fontWeight: '500', fontSize: '0.95rem' }}>"{memory.description}"</p>
                                                    {memory.uploaded_by_name && <small style={{ opacity: 0.8 }}>- {memory.uploaded_by_name}</small>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert variant="light" className="text-center p-5" style={{ border: '2px dashed #eee', borderRadius: '15px' }}>
                                    <h4 style={{ color: '#aaa' }}>No photos uploaded yet.</h4>
                                    <p style={{ color: '#bbb' }}>Check back soon to relive the best moments!</p>
                                </Alert>
                            )}
                        </div>
                    </Col>

                    {/* Right Column: Experience Comments */}
                    <Col lg={4}>
                        <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontWeight: '700', color: 'var(--dark)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                💬 Attendee Experiences
                            </h3>

                            {/* Comment Form (Requires Auth) */}
                            {token ? (
                                <Form onSubmit={handleCommentSubmit} className="mb-4">
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Did you attend? Share your favorite moment!"
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            style={{ borderRadius: '15px', resize: 'none' }}
                                        />
                                    </Form.Group>
                                    <Button type="submit" variant="dark" className="w-100 rounded-pill" disabled={submittingComment}>
                                        {submittingComment ? 'Posting...' : 'Post Experience'}
                                    </Button>
                                    <Form.Text className="text-muted text-center d-block mt-2" style={{ fontSize: '0.8rem' }}>
                                        Only registered attendees can post.
                                    </Form.Text>
                                </Form>
                            ) : (
                                <Alert variant="info" className="text-center" style={{ borderRadius: '10px' }}>
                                    <Link to="/login" className="alert-link">Log in</Link> to share your experience!
                                </Alert>
                            )}

                            <hr style={{ borderColor: '#eee' }} />

                            {/* Comments List */}
                            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px' }}>
                                {event.memory_comments && event.memory_comments.length > 0 ? (
                                    event.memory_comments.map(comment => (
                                        <div key={comment.id} style={{
                                            padding: '1rem',
                                            background: 'var(--background)',
                                            borderRadius: '15px',
                                            marginBottom: '1rem',
                                            position: 'relative'
                                        }}>
                                            <p style={{ margin: '0 0 0.5rem 0', color: '#444', fontSize: '0.95rem', lineHeight: '1.5' }}>"{comment.comment}"</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <small style={{ color: 'var(--primary)', fontWeight: 'bold' }}>👤 {comment.user_name || 'Attendee'}</small>
                                                <small style={{ color: '#aaa' }}>{new Date(comment.created_at).toLocaleDateString()}</small>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5" style={{ color: '#aaa' }}>
                                        <p>No experiences shared yet.</p>
                                        <p style={{ fontSize: '0.9rem' }}>Be the first to leave a memory!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .memory-card-hover:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
                }
            `}</style>
        </div>
    );
};
export default MemoryBook;
