import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa'; // Assuming react-icons is installed

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hi! I am the EventKonnect AI. Ask me anything about events, or try asking for help!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatState, setChatState] = useState('idle'); // conversational state machine
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const searchEvents = async (query) => {
        try {
            // Clean up query if they said "all"
            const searchQuery = query === 'all' ? '' : query;
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/events/public/?search=${searchQuery}`);
            const events = response.data;
            if (events.length > 0) {
                const links = events.slice(0, 3).map(e => ({ url: `/event-details/${e.id}`, text: e.title }));
                return { text: `Here are some ${searchQuery ? `'${searchQuery}' ` : ''}events I found:`, links };
            }
            return null; // Return null instead of error message so caller can handle gracefully
        } catch (err) {
            return { text: "Sorry, I'm having trouble fetching events right now." };
        }
    };

    const processInput = async (text) => {
        const lowerText = text.toLowerCase();

        const matchAny = (words) => words.some(w => lowerText.includes(w));

        // State Machine: Follow-up Questions
        if (chatState === 'awaiting_search') {
            setChatState('idle');
            const searchResults = await searchEvents(lowerText);
            if (searchResults) return searchResults;
            return { text: `Sorry, I couldn't find any events matching '${lowerText}'. Try searching for something else, or use words like 'tech' or 'music'.` };
        }

        // 1. Greetings & Conversations
        if (matchAny(['hello', 'hi ', 'hi!', 'hey', 'greetings', 'who are you'])) {
            return { text: "Hello! I am your EventKonnect AI Assistant. I can help you find events, guide you through registration, or answer platform questions. What do you need help with today?" };
        }

        if (lowerText === 'hi') return { text: "Hi there! How can I help you today?" };
        if (matchAny(['thank'])) return { text: "You're welcome! Let me know if you need anything else." };

        // 2. Discover / Search Flows
        if (matchAny(['search', 'find event', 'looking for', 'explore'])) {
            setChatState('awaiting_search');
            return { text: "I can help with that! What kind of events are you looking for? (e.g., 'tech', 'music', 'business', or 'all')" };
        }

        // Direct Event Search Assistance (Quick Keywords)
        const searchKeywords = ['tech', 'sports', 'upcoming', 'music', 'workshop', 'art', 'business', 'comedy', 'startup'];
        for (const word of searchKeywords) {
            if (lowerText.includes(word)) {
                const results = await searchEvents(word === 'upcoming' ? '' : word);
                if (results) return results;
                return { text: `Sorry, I couldn't find any ${word} events right now.` };
            }
        }

        // 2. Registration Guidance
        if (lowerText.includes('how to register') || lowerText.includes('register for an event')) {
            return { text: "To register for an event:\n1. Login to your Attendee account.\n2. Browse upcoming events.\n3. Click on event details.\n4. Click the 'Register Now' button." };
        }
        if (lowerText.includes('how to create event') || lowerText.includes('create an event')) {
            return { text: "To create an event:\n1. Login as an Organizer.\n2. Go to your Dashboard.\n3. Click '+ Create Event'.\n4. Fill in the event details and submit for Admin approval." };
        }

        // 3. Role-based Help
        if (lowerText.includes('help')) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role === 'admin') return { text: "Admin Help: You can approve events, manage users, and view platform reports from your dashboard." };
                if (user.role === 'organizer') return { text: "Organizer Help: You can create events, manage attendees, scan QR codes, and view event analytics from your dashboard." };
                if (user.role === 'attendee') return { text: "Attendee Help: You can browse events, book tickets, view your QR codes in 'My Tickets', and receive notifications." };
            }
            return { text: "It looks like you aren't logged in. Please login to get personalized help, or ask me general questions about the platform!" };
        }

        // 4. Simple FAQ Matching
        const faqMap = {
            'what is eventkonnect': 'EventKonnect is a smart event management system where organizers create events and attendees register and participate easily.',
            'how do i login': 'Click Login on the homepage and enter your registered email and password.',
            'pending approval': 'All events require admin approval before becoming visible to attendees.',
            'where can i see my tickets': 'Go to My Tickets in your dashboard to view and download your QR ticket.',
            'how do i check in': 'Show your QR code or provide your 6-digit ticket code to the organizer for verification at the event.',
            'cancel my registration': 'Yes, you can cancel your registration before the event starts from the My Tickets section.',
            'view event details': 'Click on any event card to open the full event details page.',
            'registered attendees': 'Organizers can go to My Events and select an event to view the attendee list.',
            'generate reports': 'Admins can go to the Reports section in the dashboard and apply filters to generate reports.',
            'forget my password': 'Click on the Forgot Password option on the login page to reset your password.',
            'is my data secure': 'Yes, user data is securely stored and protected with authentication and role-based access control.',
            'refund': 'Refund policies vary by event. Please contact the event organizer directly for refund requests.',
            'contact support': 'You can reach our support team by heading to the Contact page from the navigation bar.',
            'how to update profile': 'You can update your profile from the dashboard by clicking on Profile Settings.',
            'buy multiple tickets': 'Currently, each registration is individual. You need to register separately for each attendee unless specified otherwise by the organizer.',
            'payment methods': 'We support major credit/debit cards, net banking, and secure online payment gateways.',
            'become an organizer': 'Yes! You can register as an organizer on the signup page by selecting the Organizer role.',
            'download ticket': 'You can download your digital ticket from the My Tickets section in your attendee dashboard.',
            'email notifications': 'You will receive email updates regarding your event registrations, cancellations, and other important announcements.',
            'free events': 'Yes, we host many free events! Check the events page to browse free sessions and workshops.',
            'delete account': 'To delete your account, please send a request through our Contact page.',
            'share event': 'You can share an event by copying the link from the event details page and sending it to your friends.'
        };

        for (const [key, answer] of Object.entries(faqMap)) {
            if (lowerText.includes(key)) {
                return { text: answer };
            }
        }

        // 5. Fallback Response
        // Try searching the database with their query just in case they typed an event name or category
        const directSearch = await searchEvents(lowerText);
        if (directSearch) return directSearch;

        // Ultimate Fallback
        return { text: "Sorry, I didn't quite catch that. Try asking:\n- 'How to register?'\n- 'Find events'\n- 'Help me'" };
    };

    const sendMessage = async (text) => {
        const userMsg = { id: Date.now(), sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        const responseObj = await processInput(text);

        const botMsg = {
            id: Date.now() + 1,
            sender: 'bot',
            text: responseObj.text,
            links: responseObj.links
        };
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const currentInput = input;
        setInput('');
        await sendMessage(currentInput);
    };

    const handleSuggestionClick = (question) => {
        sendMessage(question);
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '100%',
                    maxWidth: '350px',
                    height: '450px',
                    maxHeight: '80vh', /* Prevents it taking full height on very small phones */
                    background: 'var(--card)',
                    borderRadius: '15px',
                    boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ background: '#2c3e50', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaRobot />
                            <span style={{ fontWeight: 'bold' }}>EventKonnect AI</span>
                        </div>
                        <FaTimes style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                    </div>

                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: 'var(--background)' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                marginBottom: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '10px 15px',
                                    borderRadius: '15px',
                                    background: msg.sender === 'user' ? '#007bff' : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#333',
                                    boxShadow: msg.sender === 'bot' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                    borderBottomRightRadius: msg.sender === 'user' ? '0' : '15px',
                                    borderBottomLeftRadius: msg.sender === 'bot' ? '0' : '15px'
                                }}>
                                    {msg.text}
                                </div>
                                {msg.links && (
                                    <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                                        {msg.links.map((link, idx) => (
                                            <a key={idx} href={link.url} style={{ fontSize: '0.8rem', color: '#007bff', background: '#e7f1ff', padding: '5px 10px', borderRadius: '10px', textDecoration: 'none' }}>
                                                {link.text} ↗
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && <div style={{ color: '#aaa', fontSize: '0.9rem', marginLeft: '10px' }}>Typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Auto Suggestions FAQ */}
                    <div className="no-scrollbar" style={{ padding: '10px', display: 'flex', gap: '8px', overflowX: 'auto', background: 'var(--background)', borderTop: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        {["Find Events", "How to Register", "Upcoming Events", "How to check in?", "Free Events", "Download Ticket"].map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(q)}
                                disabled={loading}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    background: 'var(--card)',
                                    border: '1px solid #007bff',
                                    color: '#007bff',
                                    borderRadius: '15px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                                onMouseOver={(e) => { if (!loading) { e.currentTarget.style.background = '#007bff'; e.currentTarget.style.color = 'white'; } }}
                                onMouseOut={(e) => { if (!loading) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#007bff'; } }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSend} style={{ padding: '10px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', background: 'var(--card)' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
                        />
                        <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: '#2c3e50',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <FaRobot />
                </button>
            )}
        </div>
    );
};

export default Chatbot;
