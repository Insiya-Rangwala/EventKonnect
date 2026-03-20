import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaQrcode, FaChartLine, FaCalendarAlt, FaMapMarkerAlt, FaMusic, FaLaptopCode, FaPalette, FaUsers, FaStar, FaQuoteLeft, FaSearch, FaTicketAlt, FaHandshake } from 'react-icons/fa';
import axios from 'axios';

const Home = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/events/public/?sort=upcoming`);
                // Get top 3 upcoming events
                setFeaturedEvents(response.data.slice(0, 3));
            } catch (err) {
                console.error("Failed to fetch featured events", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <div className="home-wrapper">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-badge">Your Ultimate Event Platform</span>
                    <h1>Discover & Connect at Amazing Events</h1>
                    <p>Your portal to unforgettable experiences. Browse trending events, secure your tickets, and manage everything effortlessly.</p>
                    <div className="hero-buttons">
                        <Link to="/events" className="btn btn-primary btn-hero">Explore Events</Link>
                        <Link to={isAuthenticated ? "/dashboard/organizer" : "/register"} className="btn btn-outline btn-hero-outline">Host an Event</Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>10,000+</h3>
                        <p>Events Hosted</p>
                    </div>
                    <div className="stat-card">
                        <h3>500k+</h3>
                        <p>Tickets Sold</p>
                    </div>
                    <div className="stat-card">
                        <h3>5,000+</h3>
                        <p>Organizers</p>
                    </div>
                    <div className="stat-card">
                        <h3>4.9/5</h3>
                        <p>User Rating</p>
                    </div>
                </div>
            </section>

            {/* Browse Categories */}
            <section className="categories-section">
                <div className="section-header">
                    <h2 className="section-title">Explore by Category</h2>
                </div>
                <div className="categories-grid">
                    <Link to="/events?category=Technology" className="category-card tech">
                        <div className="cat-icon-wrap"><FaLaptopCode className="category-icon" /></div>
                        <h3>Technology</h3>
                        <p>Conferences & Hackathons</p>
                    </Link>
                    <Link to="/events?category=Music" className="category-card music">
                        <div className="cat-icon-wrap"><FaMusic className="category-icon" /></div>
                        <h3>Music</h3>
                        <p>Concerts & Festivals</p>
                    </Link>
                    <Link to="/events?category=Arts" className="category-card arts">
                        <div className="cat-icon-wrap"><FaPalette className="category-icon" /></div>
                        <h3>Arts & Culture</h3>
                        <p>Exhibitions & Shows</p>
                    </Link>
                    <Link to="/events?category=Networking" className="category-card networking">
                        <div className="cat-icon-wrap"><FaUsers className="category-icon" /></div>
                        <h3>Networking</h3>
                        <p>Meetups & Mixers</p>
                    </Link>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works-section">
                <div className="section-header">
                    <h2 className="section-title">How EventKonnect Works</h2>
                    <p className="section-subtitle">A seamless experience from discovery to attendance.</p>
                </div>
                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <div className="step-icon-wrapper"><FaSearch className="step-icon" /></div>
                        <h3>Discover</h3>
                        <p>Find events that match your interests from our curated selection.</p>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="step-icon-wrapper"><FaTicketAlt className="step-icon" /></div>
                        <h3>Register</h3>
                        <p>Securely purchase tickets and get instant QR code access.</p>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="step-icon-wrapper"><FaHandshake className="step-icon" /></div>
                        <h3>Connect</h3>
                        <p>Attend the event, network with others, and create memories.</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Why Choose EventKonnect?</h2>
                    <p className="section-subtitle">Everything you need to host and manage events seamlessly.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card tint-primary hover-lift">
                        <div className="feature-icon"><FaShieldAlt /></div>
                        <h3>Secure Role-Based Access</h3>
                        <p>Dedicated dashboards for admins, organizers, and attendees with secure data handling.</p>
                    </div>
                    <div className="feature-card tint-secondary hover-lift">
                        <div className="feature-icon"><FaQrcode /></div>
                        <h3>QR Ticketing</h3>
                        <p>Seamless check-ins with automated QR code ticket generation and scanning.</p>
                    </div>
                    <div className="feature-card tint-success hover-lift">
                        <div className="feature-icon"><FaChartLine /></div>
                        <h3>Real-Time Analytics</h3>
                        <p>Track event performance, registration trends, and attendance in real-time.</p>
                    </div>
                </div>
            </section>

            {/* Event Preview Section */}
            <section className="featured-events-section">
                <div className="section-header">
                    <h2 className="section-title">Upcoming Featured Events</h2>
                </div>
                <div className="events-list">
                    {loading ? (
                        <p style={{ textAlign: 'center', width: '100%', color: 'var(--text)' }}>Loading featured events...</p>
                    ) : featuredEvents.length === 0 ? (
                        <p style={{ textAlign: 'center', width: '100%', color: 'var(--text)' }}>No upcoming events found.</p>
                    ) : (
                        featuredEvents.map((event, index) => (
                            <div key={event.id} className="event-horizontal-card hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="event-poster" style={{
                                    backgroundImage: event.image ? `url(${event.image.startsWith('http') ? event.image : 'http://127.0.0.1:8000' + event.image})` : 'none',
                                    backgroundColor: event.image ? 'transparent' : 'var(--primary)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}>
                                    <span className="event-badge">{event.category}</span>
                                </div>
                                <div className="event-info">
                                    <h3>{event.title}</h3>
                                    <div className="event-details-row">
                                        <span><FaCalendarAlt /> {new Date(event.date).toLocaleDateString()}</span>
                                        <span><FaMapMarkerAlt /> {event.venue}</span>
                                    </div>
                                    <p className="event-desc">
                                        {event.description && event.description.length > 120
                                            ? event.description.substring(0, 120) + '...'
                                            : event.description || 'No description available.'}
                                    </p>
                                    <Link to={`/event-details/${event.id}`} className="btn btn-primary btn-view">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="section-header">
                    <h2 className="section-title">What Our Users Say</h2>
                </div>
                <div className="testimonials-grid">
                    <div className="testimonial-card hover-lift">
                        <FaQuoteLeft className="quote-icon" />
                        <p>"EventKonnect completely transformed how we handle ticketing for our tech series. The QR scanning is lightning fast!"</p>
                        <div className="testimonial-author">
                            <div className="author-avatar" style={{background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)'}}>S</div>
                            <div>
                                <h4>Sarah J.</h4>
                                <span>Tech Organizer</span>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card hover-lift">
                        <FaQuoteLeft className="quote-icon" />
                        <p>"As an attendee, having all my tickets and event memories in one clean dashboard is just fantastic. Highly recommended."</p>
                        <div className="testimonial-author">
                            <div className="author-avatar" style={{background: 'linear-gradient(45deg, #4D96FF, #6BCB77)'}}>M</div>
                            <div>
                                <h4>Michael T.</h4>
                                <span>Design Student</span>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card hover-lift">
                        <FaQuoteLeft className="quote-icon" />
                        <p>"The real-time analytics let us adjust our marketing on the fly. We sold out 3 days earlier than last year."</p>
                        <div className="testimonial-author">
                            <div className="author-avatar" style={{background: 'linear-gradient(45deg, #9D4EDD, #FF6B6B)'}}>E</div>
                            <div>
                                <h4>Elena G.</h4>
                                <span>Festival Director</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bottom-cta-section" style={{
                backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(99, 102, 241, 0.95)), url("/event_images/concert.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: 'white'
            }}>
                <div className="cta-content">
                    <h2>Ready to Host Your Next Big Event?</h2>
                    <p>Join thousands of organizers creating seamless experiences on EventKonnect.</p>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-primary btn-hero">Start for Free</Link>
                        <Link to="/events" className="btn btn-light-outline">Browse Events</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
