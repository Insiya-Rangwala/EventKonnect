import React, { useState } from 'react';
import axios from 'axios';

const VerifyTicket = () => {
    const [ticketId, setTicketId] = useState('');
    const [status, setStatus] = useState(null); // 'valid', 'used', 'invalid', 'error'
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/tickets/verify/',
                { ticket_id: ticketId },
                { headers: { 'Authorization': `Token ${token}` } }
            );
            setStatus(response.data.status); // 'valid', 'used', 'invalid'
            setMessage(response.data.message);
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(err.response?.data?.message || "Verification Failed/Ticket Not Found");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
            <h1 style={{ color: 'var(--dark)', marginBottom: '2rem' }}>Verify Ticket</h1>

            <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: '15px', width: '100%', maxWidth: '500px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontWeight: 'bold', color: 'var(--text)' }}>Enter 6-Digit Entry Code or Ticket ID:</label>
                    <input
                        type="number"
                        placeholder="e.g. 000015"
                        value={ticketId}
                        onChange={(e) => setTicketId(e.target.value)}
                        style={{ padding: '1rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1.2rem' }}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '1rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Verifying...' : 'Check In'}
                    </button>
                </form>

                {status && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', padding: '1.5rem', borderRadius: '10px', background: status === 'valid' ? '#E8F5E9' : status === 'used' ? '#FFF3E0' : '#FFEBEE' }}>
                        {status === 'valid' && <h2 style={{ color: '#4CAF50', margin: 0 }}>✅ ACCESS GRANTED</h2>}
                        {status === 'used' && <h2 style={{ color: '#FF9800', margin: 0 }}>⚠️ ALREADY USED</h2>}
                        {(status === 'invalid' || status === 'error') && <h2 style={{ color: '#F44336', margin: 0 }}>❌ ACCESS DENIED</h2>}
                        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: 'var(--text)' }}>{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyTicket;
