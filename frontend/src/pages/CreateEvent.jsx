import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        capacity: '',
        category: 'Conference',
        visibility: 'PUBLIC',
        college: '',
    });
    const [image, setImage] = useState(null);
    const [selectedDefaultImage, setSelectedDefaultImage] = useState(null);
    const [colleges, setColleges] = useState([]);

    React.useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/users/colleges/');
                setColleges(response.data);
            } catch (err) {
                console.error("Failed to load colleges", err);
            }
        };
        fetchColleges();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
        setSelectedDefaultImage(null); // Clear default if custom is chosen
    };

    const handleDefaultImageSelect = (imgPath) => {
        setSelectedDefaultImage(imgPath);
        setImage(null); // Clear custom if default is chosen
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error("You must be logged in.");
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('date', formData.date);
        data.append('venue', formData.venue);
        data.append('capacity', formData.capacity);
        data.append('category', formData.category);
        data.append('visibility', formData.visibility);
        if (formData.visibility === 'COLLEGE' && formData.college) {
            data.append('college', formData.college);
        }

        let finalImage = image;

        if (selectedDefaultImage) {
            try {
                // Fetch the local default image and convert to File object
                const response = await fetch(selectedDefaultImage);
                const blob = await response.blob();
                finalImage = new File([blob], selectedDefaultImage.split('/').pop(), { type: blob.type });
            } catch (err) {
                console.error("Failed to load default image", err);
                toast.error("Failed to process the selected default image.");
                return;
            }
        }

        if (finalImage) {
            data.append('image', finalImage);
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/events/create/', data, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Event submitted for Admin approval!');
            setTimeout(() => navigate('/dashboard/organizer/my-events'), 2000); // Redirect to My Events
        } catch (err) {
            console.error(err);
            toast.error('Failed to create event. Please check inputs.');
        }
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--dark)' }}>Post a New Event</h1>
            <div className="form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Event Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} type="text" placeholder="e.g. Annual Hackathon 2026" required />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="Conference">Conference</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Meetup">Meetup</option>
                            <option value="Hackathon">Hackathon</option>
                            <option value="Concert">Concert</option>
                            <option value="Exhibition">Exhibition</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Date & Time</label>
                            <input name="date" value={formData.date} onChange={handleChange} type="datetime-local" required />
                        </div>
                        <div className="form-group">
                            <label>Venue</label>
                            <input name="venue" value={formData.venue} onChange={handleChange} type="text" placeholder="Building/Room No." required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Tell attendees what to expect..." required></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Capacity</label>
                            <input name="capacity" value={formData.capacity} onChange={handleChange} type="number" placeholder="Max attendees" required />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Event Image (Optional)</label>

                            {/* Default Image Gallery */}
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Choose a default cover:</p>
                                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                                    {['conference.png', 'workshop.png', 'meetup.png', 'hackathon.png', 'concert.png', 'exhibition.png'].map(imgName => (
                                        <div key={imgName} style={{ textAlign: 'center' }}>
                                            <img
                                                src={`/event_images/${imgName}`}
                                                alt={`Default ${imgName}`}
                                                onClick={() => handleDefaultImageSelect(`/event_images/${imgName}`)}
                                                style={{
                                                    width: '100px',
                                                    height: '70px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    border: selectedDefaultImage === `/event_images/${imgName}` ? '3px solid var(--primary)' : '2px solid transparent',
                                                    opacity: selectedDefaultImage === `/event_images/${imgName}` ? 1 : 0.7,
                                                    transition: 'all 0.2s'
                                                }}
                                            />
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text)', marginTop: '4px', textTransform: 'capitalize' }}>{imgName.split('.')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Or upload your own:</p>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px', width: '100%' }}
                            />
                            {image && <p style={{ fontSize: '0.8rem', color: 'green', marginTop: '0.5rem' }}>Custom image selected: {image.name}</p>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Event Visibility</label>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <label style={{ flex: 1, padding: '0.8rem', border: formData.visibility === 'PUBLIC' ? '2px solid var(--primary)' : '2px solid var(--border)', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: formData.visibility === 'PUBLIC' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', transition: 'all 0.2s' }}>
                                <input type="radio" name="visibility" value="PUBLIC" checked={formData.visibility === 'PUBLIC'} onChange={handleChange} style={{ display: 'none' }} />
                                <span style={{ fontWeight: 600, color: formData.visibility === 'PUBLIC' ? 'var(--primary)' : '#666' }}>Public Event</span>
                            </label>
                            <label style={{ flex: 1, padding: '0.8rem', border: formData.visibility === 'COLLEGE' ? '2px solid var(--primary)' : '2px solid var(--border)', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: formData.visibility === 'COLLEGE' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', transition: 'all 0.2s' }}>
                                <input type="radio" name="visibility" value="COLLEGE" checked={formData.visibility === 'COLLEGE'} onChange={handleChange} style={{ display: 'none' }} />
                                <span style={{ fontWeight: 600, color: formData.visibility === 'COLLEGE' ? 'var(--primary)' : '#666' }}>College Only</span>
                            </label>
                        </div>
                    </div>

                    {formData.visibility === 'COLLEGE' && (
                        <div className="form-group">
                            <label>Select Associated College</label>
                            <select name="college" value={formData.college} onChange={handleChange} required={formData.visibility === 'COLLEGE'} style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }}>
                                <option value="">-- Choose a College --</option>
                                {colleges.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn-submit">Submit for Approval</button>
                        <button type="button" onClick={() => navigate(-1)} className="btn-action" style={{ background: '#999' }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
