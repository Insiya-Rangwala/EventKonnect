import React from 'react';

const FAQ = () => {
    const faqs = [
        { q: "What is EventKonnect?", a: "EventKonnect is a smart event management system where organizers create events and attendees register and participate easily." },
        { q: "How do I register or login?", a: "Click Login or Register on the homepage to access your account." },
        { q: "How do I create an event?", a: "Login as an Organizer and click on Create Event from your dashboard." },
        { q: "Why is my event pending approval?", a: "All events require admin approval before becoming visible to attendees." },
        { q: "Where can I see my tickets?", a: "Go to My Tickets in your dashboard to view and download your QR ticket." },
        { q: "How do I check in at an event?", a: "Show your QR code or provide your 6-digit ticket code to the organizer for verification." },
        { q: "Can I cancel my registration?", a: "Yes, you can cancel your registration before the event starts from the My Tickets section." },
        { q: "How do I view event details?", a: "Click on any event card to open the full event details page." },
        { q: "How do I see registered attendees?", a: "Organizers can go to My Events and select an event to view the attendee list." },
        { q: "Is my data secure?", a: "Yes, user data is securely stored and protected with authentication and role-based access control." },
        { q: "How do I get a refund?", a: "Refund policies depend on the event organizer. Please reach out to them directly." },
        { q: "How do I contact support?", a: "You can submit an inquiry via our Contact page in the navigation bar." }
    ];

    return (
        <div style={{
            maxWidth: '800px',
            margin: '4rem auto',
            padding: '2rem',
            background: 'var(--card)',
            borderRadius: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
        }}>
            <h1 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Frequently Asked Questions</h1>

            {faqs.map((faq, index) => (
                <div key={index} style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--card)', borderRadius: '15px', borderLeft: '5px solid var(--primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ color: 'var(--dark)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{faq.q}</h3>
                    <p style={{ color: 'var(--text)', marginBottom: 0, fontSize: '1.05rem', lineHeight: '1.6' }}>{faq.a}</p>
                </div>
            ))}
        </div>
    );
};

export default FAQ;
