import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUserCheck, FaTicketAlt, FaTrophy, FaDownload } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const OrganizerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_created: 0,
        total_registrations: 0,
        total_checkins: 0,
        popular_event: '',
        registrations_by_event: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/analytics/organizer/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch organizer stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Transform data for recharts
    const chartData = stats.registrations_by_event.map(e => ({
        name: e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
        registrations: e.ticket_count
    }));

    const handleExportReport = () => {
        if (!stats.registrations_by_event || stats.registrations_by_event.length === 0) {
            alert("No data available to export.");
            return;
        }

        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Event Name,Total Registrations,Check-ins,Status\n";

        // CSV Rows
        stats.registrations_by_event.forEach(event => {
            const row = `"${event.title}",${event.ticket_count || 0},${event.checkin_count || 0},${event.status}`;
            csvContent += row + "\n";
        });

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Organizer_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Container fluid style={{ padding: '2rem 3rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: 'var(--dark)', fontWeight: '700', margin: 0 }}>Organizer Overview</h2>
                <div>
                    <button className="btn btn-outline-secondary me-3" onClick={handleExportReport}>
                        <FaDownload className="me-2" /> Export Report
                    </button>
                    <button className="btn btn-outline-primary me-3" onClick={() => navigate('/dashboard/organizer/check-in')}>
                        <FaUserCheck className="me-2" /> Scan QR
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/create-event')}>
                        + Create Event
                    </button>
                </div>
            </div>

            {/* Top Section - Stats Cards */}
            <Row className="mb-4">
                <Col md={3} sm={6} className="mb-3 mb-md-0">
                    <div className="dashboard-stat-card border-primary animate-slide-up hover-lift" style={{ animationDelay: '0.1s' }}>
                        <div className="stat-icon-wrapper">
                            <FaCalendarAlt />
                        </div>
                        <div className="stat-value">{loading ? <Skeleton width={60} baseColor="var(--background)" highlightColor="var(--border)" /> : stats.total_created}</div>
                        <div className="stat-label">Events Created</div>
                    </div>
                </Col>
                <Col md={3} sm={6} className="mb-3 mb-md-0">
                    <div className="dashboard-stat-card border-secondary animate-slide-up hover-lift" style={{ animationDelay: '0.2s' }}>
                        <div className="stat-icon-wrapper secondary">
                            <FaTicketAlt />
                        </div>
                        <div className="stat-value">{loading ? <Skeleton width={60} baseColor="var(--background)" highlightColor="var(--border)" /> : stats.total_registrations}</div>
                        <div className="stat-label">Total Registrations</div>
                    </div>
                </Col>
                <Col md={3} sm={6} className="mb-3 mb-md-0">
                    <div className="dashboard-stat-card border-success animate-slide-up hover-lift" style={{ animationDelay: '0.3s' }}>
                        <div className="stat-icon-wrapper success">
                            <FaUserCheck />
                        </div>
                        <div className="stat-value">{loading ? <Skeleton width={60} baseColor="var(--background)" highlightColor="var(--border)" /> : stats.total_checkins}</div>
                        <div className="stat-label">Total Check-ins</div>
                    </div>
                </Col>
                <Col md={3} sm={6}>
                    <div className="dashboard-stat-card border-primary animate-slide-up hover-lift" style={{ animationDelay: '0.4s' }}>
                        <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                            <FaTrophy />
                        </div>
                        <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {loading ? <Skeleton width={120} baseColor="var(--background)" highlightColor="var(--border)" /> : (stats.popular_event || "None")}
                        </div>
                        <div className="stat-label">Top Event</div>
                    </div>
                </Col>
            </Row>

            {/* Middle Section - Analytics Charts */}
            <Row className="mb-4">
                <Col md={12}>
                    <div className="dashboard-section-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
                        <h4 style={{ color: 'var(--dark)', fontWeight: '600' }}>Registration Trends</h4>
                        {loading ? (
                            <Skeleton height={350} style={{ borderRadius: '15px' }} baseColor="var(--background)" highlightColor="var(--border)" />
                        ) : chartData.length > 0 ? (
                            <div style={{ height: '350px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text)', fontSize: 13, fontWeight: 500 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text)', fontSize: 13, fontWeight: 500 }} dx={-10} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                boxShadow: 'var(--shadow-lg)',
                                                background: 'var(--card)',
                                                color: 'var(--text)',
                                                padding: '12px'
                                            }}
                                            itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="registrations" radius={[8, 8, 8, 8]} maxBarSize={60} animationDuration={800} isAnimationActive={true}>
                                            {
                                                chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={'url(#colorPrimary)'} />
                                                ))
                                            }
                                        </Bar>
                                        <defs>
                                            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.9} />
                                                <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.9} />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center p-5 bg-light rounded" style={{ color: 'var(--text)' }}>
                                <p>No events generated yet. Data will appear here once attendees register.</p>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Bottom Section - Recent Activity */}
            <Row>
                <Col md={12}>
                    <div className="dashboard-section-card animate-slide-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.6s' }}>
                        <div style={{ padding: '24px 24px 0' }}>
                            <h4 style={{ color: 'var(--dark)', fontWeight: '600' }}>Event Details & Quick Actions</h4>
                        </div>

                        {loading ? (
                            <div className="p-4">
                                <Skeleton count={4} height={40} style={{ marginBottom: '10px' }} baseColor="var(--background)" highlightColor="var(--border)" />
                            </div>
                        ) : stats.registrations_by_event && stats.registrations_by_event.length > 0 ? (
                            <div className="table-responsive">
                                <table className="user-table" style={{ borderTop: '1px solid var(--border)' }}>
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Registrations</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.registrations_by_event.map((event) => (
                                            <tr key={event.id}>
                                                <td style={{ fontWeight: '500' }}>{event.title}</td>
                                                <td>
                                                    <span style={{
                                                        background: 'rgba(99, 102, 241, 0.1)',
                                                        color: 'var(--primary)',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {event.ticket_count} registered
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                                            onClick={() => navigate(`/event/${event.id}/attendees`)}
                                                        >
                                                            Attendees
                                                        </button>
                                                        {event.status === 'completed' && (
                                                            <button
                                                                className="btn btn-info"
                                                                style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'white' }}
                                                                onClick={() => navigate(`/memory-book/${event.id}`)}
                                                                title="Upload photos and memories for this completed event"
                                                            >
                                                                Memory Book
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="p-4 text-muted text-center">No events found. Start by creating a new event!</p>
                        )}
                    </div>
                </Col>
            </Row>

        </Container>
    );
};

export default OrganizerDashboard;
