import React, { useState } from 'react';
import QrReader from 'react-qr-scanner';
import axios from 'axios';

const ScanQR = () => {
    const [scanResult, setScanResult] = useState('');
    const [status, setStatus] = useState(null); // 'valid', 'used', 'invalid', 'error'
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleScan = async (data) => {
        if (data && !loading) {
            // data might be an object { text: "..." } or string depending on lib version
            const text = data?.text || data; 
            
            let ticketId = null;
            let verificationCode = null;

            // Check if format is valid (Expected TICKET_ID:ID,CODE:CODE)
            if (text.startsWith('TICKET_ID:')) {
                const parts = text.split(',');
                const ticketIdPart = parts.find(p => p.startsWith('TICKET_ID:'));
                if (ticketIdPart) ticketId = ticketIdPart.split(':')[1];
                
                const codePart = parts.find(p => p.startsWith('CODE:'));
                if (codePart) verificationCode = codePart.split(':')[1];
            } else if (text.startsWith('TICKET:')) {
                // Fallback for old QR codes
                ticketId = text.split(':')[1];
            }

            if (ticketId || verificationCode) {
                setScanResult(ticketId || verificationCode);
                verifyTicket(ticketId, verificationCode);
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
        setStatus('error');
        setMessage('Camera error or permission denied.');
    };

    const verifyTicket = async (ticketId, verificationCode = null) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const payload = {};
            if (ticketId) payload.ticket_id = ticketId;
            if (verificationCode) payload.verification_code = verificationCode;

            const response = await axios.post('http://127.0.0.1:8000/api/tickets/verify/', 
                payload,
                { headers: { 'Authorization': `Token ${token}` } }
            );
            setStatus(response.data.status); // 'valid', 'used', 'invalid'
            setMessage(response.data.message);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || "Verification Failed");
        } finally {
            setLoading(false);
            // Optional: Auto-reset after 3 seconds for next scan
            setTimeout(() => {
                 setLoading(false);
                 setScanResult(''); 
                 // We don't clear status immediately so user can see result
            }, 3000);
        }
    };

    const previewStyle = {
        height: 300,
        width: 300,
        objectFit: 'cover',
        borderRadius: '20px',
        border: '5px solid #fff',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)'
    };

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
            <h1 style={{ color: 'var(--dark)', marginBottom: '2rem' }}>QR Check-in Scanner</h1>

            <div style={{ background: '#000', padding: '10px', borderRadius: '25px' }}>
                <QrReader
                    delay={500}
                    style={previewStyle}
                    onError={handleError}
                    onScan={handleScan}
                />
            </div>

            <div style={{ marginTop: '2rem', padding: '2rem', borderRadius: '15px', background: 'var(--card)', width: '100%', maxWidth: '500px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                {loading && <h3 style={{color: '#9E9E9E'}}>Verifying...</h3>}
                
                {!loading && status === 'valid' && (
                    <>
                        <h2 style={{ color: '#4CAF50', fontSize: '2.5rem' }}>✅ ACCESS GRANTED</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text)' }}>{message}</p>
                    </>
                )}

                {!loading && status === 'used' && (
                    <>
                        <h2 style={{ color: '#FF9800', fontSize: '2.5rem' }}>⚠️ ALREADY USED</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text)' }}>{message}</p>
                    </>
                )}

                {!loading && (status === 'invalid' || status === 'error') && (
                    <>
                        <h2 style={{ color: '#F44336', fontSize: '2.5rem' }}>❌ ACCESS DENIED</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text)' }}>{message}</p>
                    </>
                )}

                {!status && !loading && <p>Point camera at a Ticket QR Code to scan.</p>}
            </div>
        </div>
    );
};

export default ScanQR;
