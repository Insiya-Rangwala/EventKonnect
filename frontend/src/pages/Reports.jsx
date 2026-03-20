import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
    const [adminData, setAdminData] = useState(null);
    const [organizerData, setOrganizerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    // For simplicity, we auto-detect role or user can select (in a real app, this page might strict check role)
    // We'll try to fetch both, whichever succeeds defines what we show.

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // Try Admin fetch
            const adminRes = await axios.get('http://127.0.0.1:8000/api/analytics/admin/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setAdminData(adminRes.data);
            setUserRole('admin');
        } catch (err) {
            // If admin fails, try Organizer
            try {
                const orgRes = await axios.get('http://127.0.0.1:8000/api/analytics/organizer/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setOrganizerData(orgRes.data);
                setUserRole('organizer');
            } catch (ignore) {
                console.error("Failed to fetch reports");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCSV = async (endpoint, filename) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/analytics/${endpoint}`, {
                headers: { 'Authorization': `Token ${token}` },
                responseType: 'blob', // Important for downloading files
            });

            // Create a blob from the response data
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Failed to download report. Please ensure you have the required permissions.");
        }
    };

    if (loading) return <div className="p-4">Loading Reports...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 style={{ color: 'var(--dark)' }}>{userRole === 'admin' ? 'System Analytics' : 'Organizer Reports'}</h1>
            </div>

            {userRole === 'admin' && adminData && (
                <Row>
                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm border-0 p-3 h-100">
                            <h4 className="text-center mb-4">Events by Category</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={adminData.events_by_category}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="category"
                                    >
                                        {adminData.events_by_category.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm border-0 p-3 h-100">
                            <h4 className="text-center mb-4">Registrations Trend</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={adminData.registrations_over_time}>
                                    <XAxis dataKey="month" tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short' })} />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Registrations" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            )}

            {userRole === 'admin' && (
                <Row className="mb-4">
                    <Col>
                        <Card className="shadow-sm border-0 p-3">
                            <h4 className="mb-4">Admin Reports</h4>
                            <div className="d-flex gap-3 flex-wrap">
                                <button
                                    onClick={() => handleDownloadCSV('export/system/', 'system_analytics.csv')}
                                    className="btn btn-primary"
                                >
                                    Download System Analytics
                                </button>
                                <button
                                    onClick={() => handleDownloadCSV('export/users/', 'user_activity.csv')}
                                    className="btn btn-secondary"
                                >
                                    Download User Activity
                                </button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}

            {userRole === 'organizer' && organizerData && (
                <Row>
                    <Col md={12} className="mb-4">
                        <Card className="shadow-sm border-0 p-3">
                            <h4 className="text-center mb-4">Registrations per Event</h4>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={organizerData.registrations_by_event}>
                                    <XAxis dataKey="title" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar dataKey="ticket_count" fill="#82ca9d" name="Tickets Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            )}

            {(userRole === 'admin' || userRole === 'organizer') && (
                <Row className="mb-4">
                    <Col>
                        <Card className="shadow-sm border-0 p-3">
                            <h4 className="mb-4">Event Reports</h4>
                            {userRole === 'organizer' && (
                                <div className="mb-3">
                                    <button
                                        onClick={() => handleDownloadCSV('export/organizer/', 'organizer_events.csv')}
                                        className="btn btn-primary"
                                    >
                                        Download All My Events Summary
                                    </button>
                                </div>
                            )}

                            {/* Dropdown to select event for specific reports */}
                            {((userRole === 'organizer' && organizerData?.registrations_by_event?.length > 0) || userRole === 'admin') && (
                                <div className="mt-4">
                                    <h5>Event-Specific Downloads</h5>
                                    {/* For Admin, they'd theoretically need a list of all events here. For simplicity,
                                        we'll just render it for Organizer since organizerData has their events.
                                        If we wanted Admin event downloads here we'd need to fetch Admin's events list. */}
                                    {userRole === 'organizer' && (
                                        <div className="d-flex gap-3 flex-wrap align-items-center">
                                            <select
                                                className="form-select w-auto"
                                                onChange={(e) => {
                                                    const selectedEventId = e.target.value;
                                                    if (selectedEventId) {
                                                        // Storing selected ID in a dataset attr on buttons could work,
                                                        // but using state is cleaner. We'll inline it for now using standard JS
                                                        window.selectedEventIdForExport = selectedEventId;
                                                    }
                                                }}
                                            >
                                                <option value="">Select an Event...</option>
                                                {organizerData.registrations_by_event.map(evt => (
                                                    <option key={evt.id} value={evt.id}>{evt.title}</option>
                                                ))}
                                            </select>

                                            <button
                                                className="btn btn-outline-success"
                                                onClick={() => {
                                                    const id = window.selectedEventIdForExport;
                                                    if (id) handleDownloadCSV(`export/event/${id}/registrations/`, `event_${id}_registrations.csv`);
                                                    else alert("Please select an event first.");
                                                }}
                                            >
                                                Registrations
                                            </button>
                                            <button
                                                className="btn btn-outline-info"
                                                onClick={() => {
                                                    const id = window.selectedEventIdForExport;
                                                    if (id) handleDownloadCSV(`export/event/${id}/attendance-summary/`, `event_${id}_attendance_summary.csv`);
                                                    else alert("Please select an event first.");
                                                }}
                                            >
                                                Attendance vs Registration
                                            </button>
                                            <button
                                                className="btn btn-outline-warning"
                                                onClick={() => {
                                                    const id = window.selectedEventIdForExport;
                                                    if (id) handleDownloadCSV(`export/event/${id}/participation/`, `event_${id}_participation.csv`);
                                                    else alert("Please select an event first.");
                                                }}
                                            >
                                                Participation List
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            )}

            {!userRole && <p>No reports available for your role.</p>}
        </Container>
    );
};

export default Reports;
