import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
    const [settings, setSettings] = useState({
        college_mode: false,
        allowed_domains: '',
        max_events_per_organizer: 5,
        cancellation_policy: 'flexible',
        password_policy: 'strong',
        session_timeout: 30,
        enable_chatbot: true,
        enable_memory_book: true,
        enable_feedback_moderation: false
    });
    const [loading, setLoading] = useState(true);
    const [colleges, setColleges] = useState([]);
    const [newCollege, setNewCollege] = useState({ name: '', email_domain: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/core/settings/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                setSettings(response.data);
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setLoading(false);
            }
        };
        const fetchColleges = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/users/colleges/');
                setColleges(response.data);
            } catch (err) {
                console.error("Failed to load colleges", err);
            }
        };
        fetchSettings();
        fetchColleges();
    }, []);

    const handleAddCollege = async () => {
        if (!newCollege.name || !newCollege.email_domain) return alert('Name and domain required');
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/users/colleges/', newCollege, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setColleges([...colleges, res.data]);
            setNewCollege({ name: '', email_domain: '' });
        } catch (err) {
            console.error(err);
            alert("Failed to add college");
        }
    };

    const handleDeleteCollege = async (id) => {
        if (!window.confirm("Delete this college?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/users/colleges/${id}/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setColleges(colleges.filter(c => c.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete college");
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setSettings({ ...settings, [e.target.name]: value });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.put('http://127.0.0.1:8000/api/core/settings/', settings, {
                headers: { 'Authorization': `Token ${token}` }
            });
            alert("Settings saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save settings. Make sure you are an Admin.");
        }
    };

    const handleReset = () => {
        if (window.confirm("Reset all settings to default?")) {
            setSettings({
                college_mode: false,
                allowed_domains: 'gmail.com, edu',
                max_events_per_organizer: 5,
                cancellation_policy: 'flexible',
                password_policy: 'strong',
                session_timeout: 30,
                enable_chatbot: true,
                enable_memory_book: true,
                enable_feedback_moderation: false
            });
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Settings...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ color: 'var(--dark)' }}>System Settings</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleReset} className="btn-action" style={{ background: '#757575', padding: '0.8rem 1.5rem', fontSize: '1rem' }}>Reset Defaults</button>
                    <button onClick={handleSave} className="btn-action" style={{ background: 'var(--primary)', padding: '0.8rem 1.5rem', fontSize: '1rem' }}>Save Changes</button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* System Configuration */}
                <div className="approval-card" style={{ display: 'block' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>⚙️ System Configuration</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                Enable College Mode
                                <input
                                    type="checkbox"
                                    name="college_mode"
                                    checked={settings.college_mode}
                                    onChange={handleChange}
                                    style={{ width: 'auto' }}
                                />
                            </label>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Restricts usage to specific internal groups if enabled.</p>
                        </div>
                        <div className="form-group">
                            <label>Allowed Email Domains</label>
                            <input type="text" name="allowed_domains" value={settings.allowed_domains} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Max Events per Organizer</label>
                            <input type="number" name="max_events_per_organizer" value={settings.max_events_per_organizer} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Cancellation Policy</label>
                            <select name="cancellation_policy" value={settings.cancellation_policy} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '2px solid #eee' }}>
                                <option value="flexible">Flexible (24h before)</option>
                                <option value="strict">Strict (No refund)</option>
                                <option value="moderate">Moderate (50% refund)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Manage Colleges */}
                <div className="approval-card" style={{ display: 'block' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>🎓 Manage Colleges</h3>
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexDirection: 'row', alignItems: 'center' }}>
                        <input type="text" placeholder="College Name" value={newCollege.name} onChange={e => setNewCollege({ ...newCollege, name: e.target.value })} style={{ flex: 1, padding: '0.8rem', borderRadius: '5px', border: '1px solid #ccc' }} />
                        <input type="text" placeholder="Domain (e.g. stxaviers.edu)" value={newCollege.email_domain} onChange={e => setNewCollege({ ...newCollege, email_domain: e.target.value })} style={{ flex: 1, padding: '0.8rem', borderRadius: '5px', border: '1px solid #ccc' }} />
                        <button onClick={handleAddCollege} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {colleges.map(c => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                <span><strong>{c.name}</strong> (@{c.email_domain})</span>
                                <button onClick={() => handleDeleteCollege(c.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
                            </div>
                        ))}
                        {colleges.length === 0 && <p style={{ color: '#888', fontStyle: 'italic' }}>No colleges added yet.</p>}
                    </div>
                </div>

                {/* Security Settings */}
                <div className="approval-card" style={{ display: 'block' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>🔒 Security Settings</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Password Policy</label>
                            <select name="password_policy" value={settings.password_policy} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '2px solid #eee' }}>
                                <option value="weak">Weak (Minimum 6 chars)</option>
                                <option value="medium">Medium (Alphanumeric)</option>
                                <option value="strong">Strong (Special chars required)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Session Timeout (Minutes)</label>
                            <input type="number" name="session_timeout" value={settings.session_timeout} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* AI & Feature Toggles */}
                <div className="approval-card" style={{ display: 'block' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>🤖 AI & Features</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                            <div>
                                <label style={{ marginBottom: 0 }}>Enable AI Chatbot</label>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Assist attendees with queries automatically.</p>
                            </div>
                            <input type="checkbox" name="enable_chatbot" checked={settings.enable_chatbot} onChange={handleChange} style={{ width: 'auto', transform: 'scale(1.5)' }} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                            <div>
                                <label style={{ marginBottom: 0 }}>Enable Memory Book</label>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Allow upload of event photos and memories.</p>
                            </div>
                            <input type="checkbox" name="enable_memory_book" checked={settings.enable_memory_book} onChange={handleChange} style={{ width: 'auto', transform: 'scale(1.5)' }} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                            <div>
                                <label style={{ marginBottom: 0 }}>Feedback Moderation</label>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Require approval before showing feedback publicly.</p>
                            </div>
                            <input type="checkbox" name="enable_feedback_moderation" checked={settings.enable_feedback_moderation} onChange={handleChange} style={{ width: 'auto', transform: 'scale(1.5)' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
