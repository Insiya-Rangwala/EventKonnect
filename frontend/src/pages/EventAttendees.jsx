
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Table, Button, Badge } from 'react-bootstrap';

const EventAttendees = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [attendees, setAttendees] = useState([]);
    const [eventTitle, setEventTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendees = async () => {
            const token = localStorage.getItem('token');
            try {
                // Fetch attendees (Ticket objects)
                const response = await axios.get(`http://127.0.0.1:8000/api/events/attendees/${id}/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setAttendees(response.data);
                if (response.data.length > 0) {
                    // Ticket serializer includes 'event' object? No, usually just ID.
                    // But we can fetch event details separately if needed, or if ticket has nested event.
                    // For now, let's assume we just list them.
                }
            } catch (err) {
                console.error("Failed to fetch attendees", err);
                alert("Failed to load attendee list.");
            } finally {
                setLoading(false);
            }
        };
        fetchAttendees();
    }, [id]);

    return (
        <Container className="mt-4">
            <Button variant="outline-secondary" className="mb-3" onClick={() => navigate('/dashboard/organizer')}>
                &larr; Back to Dashboard
            </Button>
            <h2 className="mb-4">Attendee List</h2>

            {loading ? <p>Loading...</p> : (
                <div className="table-responsive shadow-sm" style={{ background: 'var(--card)', borderRadius: '15px', padding: '1rem' }}>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Attendee Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Check-in Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendees.length > 0 ? attendees.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>#{ticket.id}</td>
                                    <td>{ticket.attendee_name}</td>
                                    <td>{ticket.attendee_email}</td>
                                    <td>
                                        <Badge bg={ticket.status === 'confirmed' ? 'success' : ticket.status === 'cancelled' ? 'danger' : 'secondary'}>
                                            {ticket.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        {ticket.status === 'used' ? (
                                            <span style={{ color: 'green', fontWeight: 'bold' }}>&#10003; Checked In</span>
                                        ) : (
                                            <span style={{ color: '#ccc' }}>Pending</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center">No attendees found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default EventAttendees;
