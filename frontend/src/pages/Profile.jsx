import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ANIMATED_AVATARS = [
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f47d/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f47e/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f31f/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif',
    'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a5/512.gif'
];

const Profile = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState(localStorage.getItem('userRole') || 'attendee');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({
        fullName: '',
        email: '',
        avatar: 'https://via.placeholder.com/150',
        username: '',
        // Extras
        organizationName: '',
        contactNumber: '',
        collegeName: '',
        registeredEvents: 0,
        verificationStatus: 'Pending'
    });

    // Avatar Modal States
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
    const fileInputRef = useRef(null);

    // Password Change State
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '' });
    const [msg, setMsg] = useState('');

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/profile/`, {
                headers: { 'Authorization': `Token ${token}` }
            });

            const data = response.data;
            const generatedAvatar = `https://ui-avatars.com/api/?name=${data.email || 'User'}&background=6366F1&color=fff&rounded=true&bold=true&size=150`;

            setUser({
                fullName: `${data.first_name} ${data.last_name}`.trim(),
                email: data.email,
                username: data.username,
                avatar: data.profile_picture || generatedAvatar,

                // Flattening profile data
                organizationName: data.profile?.organization_name || '',
                contactNumber: data.profile?.contact_number || '',
                collegeName: data.profile?.college_name || '',
                registeredEvents: data.profile?.registered_events_count || 0,
                verificationStatus: data.profile?.is_verified ? 'Verified' : 'Pending'
            });
            setRole(data.role); 
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [navigate]);

    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedAvatarFile(file);
            setSelectedAvatarUrl('');
            
            // Preview it locally
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({...user, avatar: reader.result});
            };
            reader.readAsDataURL(file);
            setShowAvatarModal(false);
        }
    };

    const handleAvatarUrlSelect = (url) => {
        setSelectedAvatarUrl(url);
        setSelectedAvatarFile(null);
        setUser({...user, avatar: url});
        setShowAvatarModal(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg('');
        const token = localStorage.getItem('token');
        try {
            const names = user.fullName.split(' ');
            const first_name = names[0] || '';
            const last_name = names.slice(1).join(' ') || '';

            const formData = new FormData();
            formData.append('first_name', first_name);
            formData.append('last_name', last_name);
            
            if (role === 'organizer') {
                formData.append('organization_name', user.organizationName);
                if (user.contactNumber) formData.append('contact_number', user.contactNumber);
            }
            if (role === 'attendee') {
                formData.append('college_name', user.collegeName);
            }

            if (selectedAvatarFile) {
                formData.append('profile_picture', selectedAvatarFile);
            } else if (selectedAvatarUrl) {
                formData.append('avatar_url', selectedAvatarUrl);
            }

            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/users/profile/`, formData, {
                headers: { 
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMsg('✅ Profile updated successfully!');
            fetchProfile(); // reload profile picture gracefully
        } catch (err) {
            console.error('Profile update failed', err);
            setMsg('❌ Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
            setSelectedAvatarFile(null);
            setSelectedAvatarUrl('');
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            navigate('/', { replace: true });
            window.location.reload(); 
        }
    };

    const handleChangePassword = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/change-password/`, passwordData, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setMsg("Password changed successfully!");
            setShowPasswordChange(false);
            setPasswordData({ old_password: '', new_password: '' });
        } catch (err) {
            console.error(err);
            setMsg("Failed to change password. Check credentials.");
        }
    };

    if (loading) return <div>Loading Profile...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--dark)' }}>My Profile</h1>
            </div>

            {msg && <div style={{ padding: '10px', background: '#e8f5e9', color: 'green', marginBottom: '1rem' }}>{msg}</div>}

            <div className="form-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowAvatarModal(true)}>
                        <img src={user.avatar} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', transition: 'transform 0.2s' }} 
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', color: 'white', padding: '5px', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            📷
                        </div>
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{user.fullName || user.username}</h2>
                        <span style={{
                            background: role === 'admin' ? '#E91E63' : role === 'organizer' ? '#9C27B0' : '#2196F3',
                            color: 'white',
                            padding: '5px 15px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            textTransform: 'capitalize'
                        }}>
                            {role} Account
                        </span>
                        <p style={{ color: 'var(--text)', marginTop: '0.5rem' }}>{user.email}</p>
                    </div>
                </div>

                {/* Avatar Selection Modal */}
                {showAvatarModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '90%', position: 'relative',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}>
                            <button onClick={() => setShowAvatarModal(false)} style={{
                                position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666'
                            }}>&times;</button>
                            
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--dark)' }}>Update Profile Picture</h3>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4>Upload custom image</h4>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileChange}
                                />
                                <button 
                                    className="btn-action" 
                                    style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem', background: '#f0f0f0', color: '#333', border: '1px dashed #ccc' }}
                                    onClick={() => fileInputRef.current.click()}
                                    onMouseOver={e => e.currentTarget.style.background = '#e0e0e0'}
                                    onMouseOut={e => e.currentTarget.style.background = '#f0f0f0'}
                                >
                                    📁 Choose File from Device...
                                </button>
                            </div>

                            <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <h4 style={{ marginBottom: '1rem' }}>Or choose an animated avatar</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                                    {ANIMATED_AVATARS.map((url, i) => (
                                        <img 
                                            key={i} 
                                            src={url} 
                                            alt="Animated Avatar" 
                                            style={{ 
                                                width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer',
                                                border: selectedAvatarUrl === url ? '3px solid var(--primary)' : '2px solid transparent',
                                                transition: 'transform 0.2s, box-shadow 0.2s', background: '#f5f5f5',
                                                boxShadow: selectedAvatarUrl === url ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseOut={e => e.currentTarget.style.transform = selectedAvatarUrl === url ? 'scale(1.05)' : 'scale(1)'}
                                            onClick={() => handleAvatarUrlSelect(url)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <h3 style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '10px', color: 'var(--dark)' }}>Personal Information</h3>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={user.fullName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={user.email} disabled style={{ background: '#f5f5f5', color: '#666', border: '1px solid #ddd', cursor: 'not-allowed' }} />
                    </div>

                    {/* Role Specific Fields */}
                    {role === 'organizer' && (
                        <>
                            <h3 style={{ borderLeft: '4px solid #9C27B0', paddingLeft: '10px', color: 'var(--dark)', marginTop: '1rem' }}>Organization Details</h3>
                            <div className="form-group">
                                <label>Organization Name</label>
                                <input type="text" name="organizationName" value={user.organizationName} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Contact Number</label>
                                <input type="text" name="contactNumber" value={user.contactNumber} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Verification Status</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#E8F5E9', borderRadius: '8px', color: '#2E7D32' }}>
                                    <span>{user.verificationStatus === 'Verified' ? '✅ Verified' : '⏳ Pending'}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'attendee' && (
                        <>
                            <h3 style={{ borderLeft: '4px solid #2196F3', paddingLeft: '10px', color: 'var(--dark)', marginTop: '1rem' }}>Attendee Details</h3>
                            <div className="form-group">
                                <label>College / Institution</label>
                                <input type="text" name="collegeName" value={user.collegeName} onChange={handleChange} />
                            </div>
                        </>
                    )}

                    <h3 style={{ borderLeft: '4px solid #F44336', paddingLeft: '10px', color: 'var(--dark)', marginTop: '1rem' }}>Account Security</h3>

                    {!showPasswordChange ? (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <button onClick={() => setShowPasswordChange(true)} className="btn-action" style={{ background: '#333', padding: '0.8rem' }}>Change Password</button>
                            <button onClick={handleLogout} className="btn-action" style={{ background: '#F44336', padding: '0.8rem' }}>Logout</button>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Change Password</h4>
                            <div className="form-group">
                                <label>Old Password</label>
                                <input type="password" value={passwordData.old_password} onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={handleChangePassword} className="btn-submit" style={{ padding: '0.8rem 1.5rem' }}>Update Password</button>
                                <button onClick={() => setShowPasswordChange(false)} className="btn-action" style={{ background: '#999', padding: '0.8rem 1.5rem' }}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            onClick={handleSave}
                            className="btn-submit"
                            disabled={saving}
                            style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '1.1rem', padding: '1rem' }}
                        >
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
