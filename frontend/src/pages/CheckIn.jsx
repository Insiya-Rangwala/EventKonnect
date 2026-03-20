import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const CheckIn = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [recentCheckIns, setRecentCheckIns] = useState([]);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        // Fetch organizer's active events
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                // Let's assume Organizers can see their own events from a generic events endpoint or my-events.
                // We will just fetch the dashboard summary which has recent events, or 'my-events'.
                // Wait, what endpoint does OrganizerDashboard use? It uses `/api/events/`.
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/events/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Filter events where user is organizer
                const user = JSON.parse(localStorage.getItem('user'));
                const myEvents = response.data.filter(e => e.organizer === user.id);
                setEvents(myEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        fetchEvents();
    }, []);

    const handleManualVerify = async (e) => {
        e.preventDefault();
        if (!verificationCode || verificationCode.length !== 6) {
            setMessage({ type: 'danger', text: 'Please enter a valid 6-digit code.' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/tickets/verify/`,
                { verification_code: verificationCode },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status === 'valid') {
                setMessage({ type: 'success', text: 'Check-in successful!' });
                setVerificationCode('');
                // Add to recent check-ins
                setRecentCheckIns(prev => [{ code: verificationCode, time: new Date().toLocaleTimeString() }, ...prev]);
            } else if (response.data.status === 'used') {
                setMessage({ type: 'warning', text: 'Ticket already checked in.' });
            } else {
                setMessage({ type: 'danger', text: response.data.message });
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage({ type: 'danger', text: error.response.data.message || 'Invalid or already used ticket' });
            } else {
                setMessage({ type: 'danger', text: 'Error verifying ticket.' });
            }
        }
    };

    const handleQRScan = async (decodedText) => {
        // The decodedText is expected to be "TICKET_ID:123,CODE:758392"
        // Since we also support just ticket_id we can parse it.
        let ticketId = null;
        let code = null;

        if (decodedText.startsWith('TICKET_ID:')) {
            const parts = decodedText.split(',');
            ticketId = parts[0].split(':')[1];
            if (parts.length > 1 && parts[1].startsWith('CODE:')) {
                code = parts[1].split(':')[1];
            }
        } else if (decodedText.startsWith('TICKET:')) {
            ticketId = decodedText.split(':')[1];
        } else {
            // Fallback or unknown format
            setMessage({ type: 'danger', text: 'Invalid QR Code format.' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = code ? { verification_code: code } : { ticket_id: ticketId };
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/tickets/verify/`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status === 'valid') {
                setMessage({ type: 'success', text: 'Check-in successful from QR Scan!' });
                setRecentCheckIns(prev => [{ code: code || ticketId, time: new Date().toLocaleTimeString(), type: 'QR' }, ...prev]);

                // Stop scanning after success
                setScanning(false);
            } else if (response.data.status === 'used') {
                setMessage({ type: 'warning', text: 'Ticket already checked in.' });
            } else {
                setMessage({ type: 'danger', text: response.data.message });
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage({ type: 'danger', text: error.response.data.message || 'Invalid ticket.' });
            } else {
                setMessage({ type: 'danger', text: 'Error verifying ticket.' });
            }
        }
    };

    useEffect(() => {
        if (scanning) {
            const html5QrcodeScanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
            );

            html5QrcodeScanner.render((decodedText, decodedResult) => {
                html5QrcodeScanner.clear(); // Stop scanning
                handleQRScan(decodedText);
            }, (errorMessage) => {
                // Ignore and keep scanning
            });

            return () => {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            };
        }
    }, [scanning]);

    return (
        <Container className="py-4">
            <h2 className="mb-4">Event Check-In</h2>
            <Row>
                <Col md={8}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <Form.Group className="mb-4">
                                <Form.Label>Select Event</Form.Label>
                                <Form.Select
                                    value={selectedEvent}
                                    onChange={(e) => setSelectedEvent(e.target.value)}
                                >
                                    <option value="">-- Choose an Event --</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.title} ({new Date(event.date).toLocaleDateString()})</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {message.text && (
                                <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
                                    {message.text}
                                </Alert>
                            )}

                            {selectedEvent ? (
                                <Row>
                                    <Col md={6} className="border-end">
                                        <h5 className="mb-3"><i className="bi bi-qr-code-scan me-2"></i>QR Scanner</h5>
                                        {scanning ? (
                                            <div id="reader" width="100%"></div>
                                        ) : (
                                            <div className="text-center py-4 bg-light rounded">
                                                <Button variant="primary" onClick={() => setScanning(true)}>
                                                    Start QR Scanner
                                                </Button>
                                            </div>
                                        )}
                                    </Col>
                                    <Col md={6}>
                                        <h5 className="mb-3"><i className="bi bi-keyboard me-2"></i>Manual Entry</h5>
                                        <Form onSubmit={handleManualVerify}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>6-Digit Verification Code</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="e.g. 123456"
                                                    maxLength="6"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                />
                                            </Form.Group>
                                            <Button variant="outline-primary" type="submit" className="w-100">
                                                Verify Code
                                            </Button>
                                        </Form>
                                    </Col>
                                </Row>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    <i className="bi bi-calendar-event fs-1 mb-3 d-block"></i>
                                    Please select an event to proceed.
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">Recent Check-Ins</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {recentCheckIns.length > 0 ? (
                                recentCheckIns.map((ci, idx) => (
                                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <small className="text-muted d-block">{ci.time}</small>
                                            <strong>{ci.code}</strong>
                                        </div>
                                        <Badge bg="success" pill>
                                            <i className="bi bi-check2"></i>
                                        </Badge>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-center text-muted py-4">
                                    No recent check-ins.
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CheckIn;
