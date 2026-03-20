import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaDownload, FaChartLine, FaCalendarCheck, FaUsers, FaUserCheck } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOrganizer, setIsOrganizer] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('userRole');
            const isOrg = role === 'organizer';
            setIsOrganizer(isOrg);

            const endpoint = isOrg
                ? 'http://127.0.0.1:8000/api/analytics/organizer/'
                : 'http://127.0.0.1:8000/api/analytics/system/';

            try {
                const response = await axios.get(endpoint, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                console.log("Analytics Response:", response.data);
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleExportReport = () => {
        if (!stats) {
            alert("No data available to export.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        if (isOrganizer) {
            csvContent += "Metric,Value\n";
            csvContent += `"Total Events Created",${stats.total_created || 0}\n`;
            csvContent += `"Total Registrations",${stats.total_registrations || 0}\n`;
            csvContent += `"Total Check-ins",${stats.total_checkins || 0}\n`;

            if (stats.registrations_by_event && stats.registrations_by_event.length > 0) {
                csvContent += "\nEvent,Registrations,Check-ins\n";
                stats.registrations_by_event.forEach(item => {
                    csvContent += `"${item.title}",${item.ticket_count || 0},${item.checkin_count || 0}\n`;
                });
            }
        } else {
            csvContent += "Metric,Value\n";
            csvContent += `"Total Events",${stats.total_events || 0}\n`;
            csvContent += `"Total Registrations",${stats.total_registrations || 0}\n`;
            csvContent += `"Total Organizers",${stats.total_organizers || 0}\n`;
            csvContent += `"Total Attendees",${stats.total_attendees || 0}\n`;

            if (stats.registrations_trend && stats.registrations_trend.length > 0) {
                csvContent += "\nDate,Registrations\n";
                stats.registrations_trend.forEach(item => {
                    csvContent += `"${item.date}",${item.count}\n`;
                });
            }
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${isOrganizer ? 'My' : 'System'}_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const placeholderTrend = [
        { date: 'Jan', count: 120 }, { date: 'Feb', count: 210 },
        { date: 'Mar', count: 180 }, { date: 'Apr', count: 240 },
        { date: 'May', count: 320 }, { date: 'Jun', count: 390 }
    ];

    let chartData = [];
    if (isOrganizer) {
        chartData = stats?.registrations_by_event?.map(e => ({
            name: e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
            count: e.ticket_count
        })) || [];
    } else {
        chartData = stats?.registrations_trend?.length > 0 ? stats.registrations_trend : placeholderTrend;
    }

    return (
        <Container fluid style={{ padding: '2rem 3rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: 'var(--dark)', fontWeight: '700', margin: 0 }}>{isOrganizer ? 'My Analytics' : 'System Analytics'}</h2>
                <button className="btn btn-outline-secondary" onClick={handleExportReport}>
                    <FaDownload className="me-2" /> Export Report
                </button>
            </div>

            {/* Top Cards */}
            <Row className="mb-4">
                <Col md={4} className="mb-3 mb-md-0">
                    <div className="dashboard-stat-card border-primary animate-slide-up hover-lift" style={{ animationDelay: '0.1s' }}>
                        <div className="stat-icon-wrapper"><FaCalendarCheck /></div>
                        <div className="stat-value">{loading ? <Skeleton width={60} /> : (isOrganizer ? stats?.total_created : stats?.total_events) || 0}</div>
                        <div className="stat-label">{isOrganizer ? 'Events Created' : 'Total Events Hosted'}</div>
                    </div>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                    <div className="dashboard-stat-card border-secondary animate-slide-up hover-lift" style={{ animationDelay: '0.2s' }}>
                        <div className="stat-icon-wrapper secondary"><FaChartLine /></div>
                        <div className="stat-value">{loading ? <Skeleton width={60} /> : (stats?.total_registrations || 0)}</div>
                        <div className="stat-label">{isOrganizer ? 'Total Registrations' : 'Total System Registrations'}</div>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="dashboard-stat-card border-success animate-slide-up hover-lift" style={{ animationDelay: '0.3s' }}>
                        <div className="stat-icon-wrapper success">{isOrganizer ? <FaUserCheck /> : <FaUsers />}</div>
                        <div className="stat-value">{loading ? <Skeleton width={60} /> : (isOrganizer ? (stats?.total_checkins || 0) : ((stats?.total_organizers || 0) + (stats?.total_attendees || 0)))}</div>
                        <div className="stat-label">{isOrganizer ? 'Total Check-ins' : 'Total Active Users'}</div>
                    </div>
                </Col>
            </Row>

            {/* College Stats Area (Admin Only) */}
            {!isOrganizer && stats?.college_wise_stats && stats.college_wise_stats.length > 0 && (
                <Row className="mb-4">
                    <Col md={12}>
                        <div className="dashboard-section-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <h4 style={{ color: 'var(--dark)', fontWeight: '600', marginBottom: '1.5rem' }}>College-Wise Participation</h4>
                            <div className="table-responsive">
                                <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'var(--text)' }}>
                                    <thead style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', borderRadius: '10px 0 0 10px', color: 'var(--dark)' }}>College Name</th>
                                            <th style={{ padding: '1rem', color: 'var(--dark)' }}>Verified Students</th>
                                            <th style={{ padding: '1rem', borderRadius: '0 10px 10px 0', color: 'var(--dark)' }}>Hosted Events</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.college_wise_stats.map((c, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text)' }}>{c.name}</td>
                                                <td style={{ padding: '1rem', color: 'var(--text)' }}>{c.student_count}</td>
                                                <td style={{ padding: '1rem', color: 'var(--text)' }}>{c.event_count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Col>
                </Row>
            )}

            {/* Chart Area */}
            <Row>
                <Col md={12}>
                    <div className="dashboard-section-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
                        <h4 style={{ color: 'var(--dark)', fontWeight: '600', marginBottom: '2rem' }}>
                            {isOrganizer ? 'Registrations by Event' : 'Registration Growth Trend'}
                        </h4>
                        <div style={{ height: '400px', width: '100%' }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    {isOrganizer ? (
                                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 50 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text)', fontSize: 13, fontWeight: 500 }} dy={10} angle={-45} textAnchor="end" />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text)', fontSize: 13, fontWeight: 500 }} dx={-10} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--border)',
                                                    boxShadow: 'var(--shadow-lg)',
                                                    background: 'var(--card)',
                                                    color: 'var(--text)'
                                                }}
                                                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                                            />
                                            <Bar dataKey="count" name="Registrations" radius={[8, 8, 8, 8]} maxBarSize={60} animationDuration={800} isAnimationActive={true}>
                                                {
                                                    chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={'url(#colorRegistrationsBar)'} />
                                                    ))
                                                }
                                            </Bar>
                                            <defs>
                                                <linearGradient id="colorRegistrationsBar" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.9} />
                                                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.9} />
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    ) : (
                                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text)', fontSize: 13, fontWeight: 500 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text)', fontSize: 13, fontWeight: 500 }} dx={-10} />
                                            <Tooltip
                                                cursor={{ stroke: 'var(--secondary)', strokeWidth: 2, strokeDasharray: '5 5' }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--border)',
                                                    boxShadow: 'var(--shadow-lg)',
                                                    background: 'var(--card)',
                                                }}
                                                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="count" name="Registrations" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRegistrations)" animationDuration={800} isAnimationActive={true} />
                                        </AreaChart>
                                    )}
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center p-5 bg-light rounded h-100 d-flex align-items-center justify-content-center" style={{ color: 'var(--text)' }}>
                                    <p>No analytics data available yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Analytics;
