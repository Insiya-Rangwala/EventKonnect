
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaUserShield, FaUserTie, FaUser, FaLock, FaLockOpen } from 'react-icons/fa';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/users/manage/', {
                headers: { Authorization: `Token ${token}` }
            });
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleBlockToggle = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://127.0.0.1:8000/api/users/status/${userId}/`,
                { is_active: !currentStatus },
                { headers: { Authorization: `Token ${token}` } }
            );
            fetchUsers(); // Refresh list
        } catch (err) {
            alert('Failed to update user status');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://127.0.0.1:8000/api/users/role/${userId}/`,
                { role: newRole },
                { headers: { Authorization: `Token ${token}` } }
            );
            fetchUsers(); // Refresh list
        } catch (err) {
            alert('Failed to update user role');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text)' }}><h2>Loading users...</h2></div>;
    if (error) return <div style={{ padding: '3rem', textAlign: 'center', color: '#e74c3c' }}><h2>{error}</h2></div>;

    return (
        <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ color: 'var(--dark)', margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>User Management</h1>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: '1.2rem' }} />
                        <input
                            type="text"
                            placeholder="Search names or emails..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.8rem 1rem 0.8rem 2.8rem',
                                borderRadius: '50px',
                                border: '2px solid #eee',
                                outline: 'none',
                                width: '280px',
                                fontSize: '1rem',
                                transition: '0.3s',
                                background: 'var(--card)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = '#eee'}
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '50px',
                            border: '2px solid #eee',
                            outline: 'none',
                            background: 'var(--card)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--dark)'
                        }}
                    >
                        <option value="All">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="organizer">Organizers</option>
                        <option value="attendee">Attendees</option>
                    </select>
                </div>
            </div>

            <div style={{ overflowX: 'auto', background: 'var(--card)', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>
                            <th style={{ padding: '1.5rem 1rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>User Details</th>
                            <th style={{ padding: '1.5rem 1rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Role</th>
                            <th style={{ padding: '1.5rem 1rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Account Status</th>
                            <th style={{ padding: '1.5rem 1rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f9f9f9', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.2rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 10px rgba(57, 125, 213, 0.3)'
                                        }}>
                                            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: 'var(--dark)', fontSize: '1.1rem' }}>{user.username}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '35px',
                                            height: '35px',
                                            borderRadius: '10px',
                                            background: user.role === 'admin' ? '#fdf2e9' : user.role === 'organizer' ? '#eaf2f8' : '#eafaf1',
                                            color: user.role === 'admin' ? '#e67e22' : user.role === 'organizer' ? '#3498db' : '#2ecc71'
                                        }}>
                                            {user.role === 'admin' ? <FaUserShield /> : user.role === 'organizer' ? <FaUserTie /> : <FaUser />}
                                        </div>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            style={{
                                                padding: '0.5rem 0.5rem',
                                                borderRadius: '10px',
                                                border: '1px solid transparent',
                                                background: 'transparent',
                                                color: '#444',
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s',
                                                minWidth: '110px'
                                            }}
                                            onFocus={(e) => { if (user.role !== 'admin') { e.target.style.background = '#f0f0f0'; e.target.style.border = '1px solid #ddd'; } }}
                                            onBlur={(e) => { e.target.style.background = 'transparent'; e.target.style.border = '1px solid transparent'; }}
                                            disabled={user.role === 'admin'}
                                        >
                                            <option value="attendee">Attendee</option>
                                            <option value="organizer">Organizer</option>
                                            <option value="admin" disabled>Admin</option>
                                        </select>
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem 1rem' }}>
                                    <span style={{
                                        padding: '0.5rem 1.2rem',
                                        borderRadius: '50px',
                                        background: user.is_active ? '#eafaf1' : '#fdf2e9',
                                        color: user.is_active ? '#27ae60' : '#e67e22',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: user.is_active ? '0 4px 10px rgba(39, 174, 96, 0.1)' : '0 4px 10px rgba(230, 126, 34, 0.1)'
                                    }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.is_active ? '#27ae60' : '#e67e22' }}></span>
                                        {user.is_active ? 'Active' : 'Blocked'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem 1rem' }}>
                                    {user.role !== 'admin' ? (
                                        <button
                                            onClick={() => handleBlockToggle(user.id, user.is_active)}
                                            style={{
                                                background: user.is_active ? 'transparent' : 'var(--primary)',
                                                color: user.is_active ? '#e74c3c' : 'white',
                                                border: `2px solid ${user.is_active ? '#e74c3c' : 'var(--primary)'}`,
                                                padding: '0.6rem 1.2rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => {
                                                if (user.is_active) {
                                                    e.currentTarget.style.background = '#e74c3c';
                                                    e.currentTarget.style.color = 'white';
                                                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.3)';
                                                } else {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(57, 125, 213, 0.4)';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (user.is_active) {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.color = '#e74c3c';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                } else {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }
                                            }}
                                        >
                                            {user.is_active ? <><FaLock /> Block</> : <><FaLockOpen /> Unblock</>}
                                        </button>
                                    ) : (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            color: '#aaa',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            padding: '0.6rem 1rem',
                                            background: 'var(--background)',
                                            borderRadius: '10px'
                                        }}>
                                            <FaUserShield /> Protected
                                        </span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text)' }}>
                                    <FaSearch style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }} />
                                    <h3>No users found matching your criteria.</h3>
                                    <p>Try adjusting your search or role filters.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
