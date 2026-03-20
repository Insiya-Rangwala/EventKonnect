import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { FaChevronLeft, FaChevronRight, FaTicketAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const TicketView = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/tickets/my-tickets/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setTickets(response.data);
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        } finally {
            setLoading(false);
        }
    };

    const nextTicket = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % tickets.length);
    };

    const prevTicket = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + tickets.length) % tickets.length);
    };

    const handleCancel = async (ticketId) => {
        if (!window.confirm("Are you sure you want to cancel this ticket? The system cancellation policy will apply.")) return;
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/tickets/cancel/${ticketId}/`, {}, {
                headers: { 'Authorization': `Token ${token}` }
            });
            toast.success(response.data.message);
            fetchTickets();
            setCurrentIndex(0);
        } catch (err) {
            console.error("Cancellation failed", err);
            toast.error(err.response?.data?.error || "Failed to cancel ticket.");
        }
    };

    if (loading) return <div>Loading Tickets...</div>;

    // Beautiful Empty State 
    if (tickets.length === 0) return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'var(--card)', padding: '3rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', border: '1px solid var(--border)' }}>
                <div style={{
                    width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', margin: '0 auto 1.5rem auto'
                }}>
                    <FaTicketAlt />
                </div>
                <h2 style={{ color: 'var(--dark)', marginBottom: '1rem', fontWeight: '700' }}>No Tickets Yet!</h2>
                <p style={{ color: 'var(--text)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    You haven't registered for any events. Discover exciting conferences, concerts, and meetups happening near you!
                </p>
                <Link to="/events" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem', borderRadius: '50px', fontWeight: '600' }}>
                    Browse Upcoming Events
                </Link>
            </div>
        </div>
    );

    const currentTicket = tickets[currentIndex];
    const _manualCode = currentTicket.verification_code || String(currentTicket.id).padStart(6, '0');

    return (
        <div className="ticket-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '2rem' }}>
            <h1 style={{ color: 'var(--dark)', marginBottom: '1rem' }}>My Tickets 🎟️</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', justifyContent: 'center' }}>

                {/* Left Arrow */}
                <button
                    onClick={prevTicket}
                    style={{
                        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%',
                        width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', color: 'var(--primary)',
                        transition: 'all 0.2s', visibility: tickets.length > 1 ? 'visible' : 'hidden'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)'; }}
                >
                    <FaChevronLeft size={18} />
                </button>

                {/* Ticket Card */}
                <div className="ticket" style={{ maxWidth: '400px', width: '100%', background: 'var(--card)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <div className="ticket-header" style={{ background: 'var(--primary)', color: 'white', padding: '1.5rem', textAlign: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Ticket #{_manualCode}</h2>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9, textTransform: 'capitalize' }}>Status: {currentTicket.status}</p>
                    </div>

                    <div className="qr-area" style={{ padding: '2rem', textAlign: 'center', borderBottom: '2px dashed #eee' }}>
                        <div style={{ background: 'var(--card)', padding: '10px', display: 'inline-block', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                            <QRCodeSVG value={`TICKET_ID:${currentTicket.id},CODE:${_manualCode}`} size={180} level={"H"} />
                        </div>
                        <p style={{ marginTop: '15px', fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>Scan at Entry</p>

                        <div style={{ marginTop: '15px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Or use entry code</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '6px', color: 'var(--dark)' }}>{_manualCode}</p>
                        </div>
                    </div>

                    <div className="ticket-info" style={{ padding: '1.5rem 2rem' }}>
                        <div className="ticket-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                            <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Attendee</span>
                            <span style={{ fontWeight: '600', color: 'var(--dark)' }}>You</span>
                        </div>
                        <div className="ticket-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Event ID</span>
                            <span style={{ fontWeight: '600', color: 'var(--dark)' }}>{currentTicket.event}</span>
                        </div>
                    </div>

                    <button
                        style={{ width: '100%', padding: '16px', border: 'none', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s', borderTop: '1px solid #e2e8f0' }}
                        onMouseEnter={(e) => { e.target.style.background = '#e2e8f0'; e.target.style.color = 'var(--dark)'; }}
                        onMouseLeave={(e) => { e.target.style.background = '#f8fafc'; e.target.style.color = '#475569'; }}
                        onClick={() => window.print()}
                    >
                        Download / Print Ticket
                    </button>

                    {currentTicket.status !== 'cancelled' && currentTicket.status !== 'used' && (
                        <button
                            style={{ width: '100%', padding: '16px', border: 'none', background: '#fff1f2', color: '#e11d48', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s', borderTop: '1px solid #fecdd3' }}
                            onMouseEnter={(e) => { e.target.style.background = '#ffe4e6'; }}
                            onMouseLeave={(e) => { e.target.style.background = '#fff1f2'; }}
                            onClick={() => handleCancel(currentTicket.id)}
                        >
                            Cancel Ticket
                        </button>
                    )}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={nextTicket}
                    style={{
                        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%',
                        width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', color: 'var(--primary)',
                        transition: 'all 0.2s', visibility: tickets.length > 1 ? 'visible' : 'hidden'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)'; }}
                >
                    <FaChevronRight size={18} />
                </button>
            </div>

            {/* Dots Indicator */}
            {tickets.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                    {tickets.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: currentIndex === idx ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: currentIndex === idx ? 'var(--primary)' : '#cbd5e1',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TicketView;
