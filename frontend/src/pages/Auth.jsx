import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const Auth = () => {
    // Determine initial state based on route
    const location = useLocation();
    const isRegisterRoute = location.pathname.includes('register');
    const [isSignUp, setIsSignUp] = useState(isRegisterRoute);
    const [isAnimated, setIsAnimated] = useState(false);

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        email: '',
        fullName: '',
        password: '',
        confirmPassword: '',
        role: 'attendee',
        organizationName: '',
        college_id: ''
    });

    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [colleges, setColleges] = useState([]);
    const [systemSettings, setSystemSettings] = useState({ college_mode: false });

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [collegesRes, settingsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/colleges/`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/core/settings/`)
                ]);
                setColleges(collegesRes.data);
                setSystemSettings(settingsRes.data);
            } catch (err) {
                console.error("Failed to load dependencies", err);
            }
        };
        fetchDependencies();
    }, []);

    useEffect(() => {
        // Redirect if already logged in
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const userRole = localStorage.getItem('userRole');
        if (isAuthenticated && userRole) {
            redirectByRole(userRole);
        }

        // Update overlay state if route changes externally
        const shouldBeSignUp = location.pathname.includes('register');
        if (shouldBeSignUp !== isSignUp) {
            setIsAnimated(true);
            setIsSignUp(shouldBeSignUp);
        }
        setError('');
    }, [navigate, location.pathname, isSignUp]);

    const redirectByRole = (role) => {
        if (role === 'admin') navigate('/dashboard/admin', { replace: true });
        else if (role === 'organizer') navigate('/dashboard/organizer', { replace: true });
        else navigate('/dashboard/attendee', { replace: true });
    };

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login/`, {
                username: loginData.email,
                password: loginData.password
            });
            handleAuthSuccess(response.data);
            toast.success('Successfully logged in!');
        } catch (err) {
            console.error("Login failed", err);
            if (err.message === 'Network Error') {
                toast.error('Network error. Is the server running?');
            } else if (err.response && err.response.status === 401 || err.response?.status === 400) {
                toast.error('Login failed. Please check your credentials.');
            } else {
                toast.error('An unexpected error occurred during login.');
            }
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (registerData.password !== registerData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        // Validate college conditionally
        if (registerData.role === 'attendee' && systemSettings?.college_mode === true && !registerData.college_id) {
            toast.error("Please select a college");
            return;
        }

        try {
            const names = registerData.fullName.split(' ');
            const first_name = names[0] || '';
            const last_name = names.slice(1).join(' ') || '';

            const payload = {
                username: registerData.email,
                email: registerData.email,
                password: registerData.password,
                role: registerData.role || 'attendee',
                first_name: first_name,
                last_name: last_name,
                organization_name: registerData.role === 'organizer' ? registerData.organizationName : ''
            };

            // Only append college_id if it's an attendee AND college mode is active
            if (registerData.role === 'attendee' && systemSettings?.college_mode === true && registerData.college_id) {
                payload.college_id = parseInt(registerData.college_id, 10);
            }

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/register/`, payload);
            console.log("Registration success", response.data);

            // On successful registration, slide back to login to force sign in for security
            setIsSignUp(false);
            setLoginData({ ...loginData, email: registerData.email });
            toast.success('Registration successful! Please sign in.');
        } catch (err) {
            console.error("Registration failed", err);
            if (err.message === 'Network Error') {
                toast.error('Network error. Is the server running?');
            } else if (err.response && err.response.data) {
                toast.error("Registration failed: Invalid data");
            } else {
                toast.error('Registration failed. Please try again.');
            }
        }
    };

    const handleAuthSuccess = (data, isGoogle = false) => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('isAuthenticated', 'true');
            // Assuming the backend doesn't explicitly return email in the login response yet, 
            // we can grab it from our state since they literally just typed it in.
            if (loginData.email) {
                localStorage.setItem('userEmail', loginData.email);
            }
            const userRole = data.role || 'attendee';
            localStorage.setItem('userRole', userRole);
            
            if (isGoogle && data.is_new) {
                navigate(`/dashboard/${userRole}/profile`, { replace: true });
            } else {
                redirectByRole(userRole);
            }
        } else {
            toast.error('Authentication failed. No token received.');
        }
    };

    const handleGoogleSuccess = async (credentialResponse, roleIfNew = 'attendee') => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/google-login/`, {
                token: credentialResponse.credential,
                role: roleIfNew
            });
            handleAuthSuccess(response.data, true);
            if (response.data.is_new) {
                toast.success('Successfully signed up! Please complete your profile.');
            } else {
                toast.success('Successfully logged in with Google!');
            }
        } catch (err) {
            console.error("Google Auth failed", err);
            toast.error('Google authentication failed securely.');
        }
    };

    return (
        <div className="auth-master-container">

            <div className={`auth-container ${isSignUp ? "right-panel-active" : ""} ${isAnimated ? "is-animated" : ""}`} id="auth-container">

                {/* SIGN UP FORM */}
                <div className="auth-form-container sign-up-container">
                    <form onSubmit={handleRegisterSubmit} className="auth-form">
                        <Link to="/" className="auth-brand-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                            <img src="/logo.png" alt="EventKonnect Icon" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                            EventKonnect
                        </Link>
                        <h2>Create Account</h2>

                        <div className="auth-social-container">
                            <GoogleLogin onSuccess={(res) => handleGoogleSuccess(res, registerData.role)} onError={() => toast.error('Google auth failed')} useOneTap={false} text="signup_with" shape="pill" />
                        </div>
                        <span className="auth-divider">or use your email for registration</span>

                        <div className="auth-input-group row-group">
                            <input type="text" name="fullName" value={registerData.fullName} onChange={handleRegisterChange} placeholder="Full Name" required />
                            <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} placeholder="Email" required />
                        </div>

                        <div className="auth-role-selector">
                            <label className={registerData.role === 'attendee' ? 'active' : ''}>
                                <input type="radio" name="role" value="attendee" checked={registerData.role === 'attendee'} onChange={handleRegisterChange} />
                                Attendee
                            </label>
                            <label className={registerData.role === 'organizer' ? 'active' : ''}>
                                <input type="radio" name="role" value="organizer" checked={registerData.role === 'organizer'} onChange={handleRegisterChange} />
                                Organizer
                            </label>
                        </div>

                        {registerData.role === 'organizer' && (
                            <input className="auth-full-input" type="text" name="organizationName" value={registerData.organizationName} onChange={handleRegisterChange} placeholder="Organization Name" required />
                        )}
                        {registerData.role === 'attendee' && systemSettings?.college_mode === true && (
                            <select
                                className="auth-full-input"
                                name="college_id"
                                value={registerData.college_id}
                                onChange={handleRegisterChange}
                                required={systemSettings?.college_mode === true}
                                style={{ marginBottom: '1rem', padding: '12px 15px', background: '#eee', border: 'none', borderRadius: '8px', width: '100%', fontFamily: 'inherit', color: 'var(--text)' }}
                            >
                                <option value="">-- Select Your College --</option>
                                {colleges.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} (@{c.email_domain})</option>
                                ))}
                            </select>
                        )}

                        <div className="auth-input-group row-group">
                            <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} placeholder="Password" required />
                            <input type="password" name="confirmPassword" value={registerData.confirmPassword} onChange={handleRegisterChange} placeholder="Confirm" required />
                        </div>

                        <button className="btn btn-primary auth-submit-btn" type="submit">Sign Up</button>
                    </form>
                </div>

                {/* SIGN IN FORM */}
                <div className="auth-form-container sign-in-container">
                    <form onSubmit={handleLoginSubmit} className="auth-form">
                        <Link to="/" className="auth-brand-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                            <img src="/logo.png" alt="EventKonnect Icon" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                            EventKonnect
                        </Link>
                        <h2>Sign in</h2>

                        <div className="auth-social-container">
                            <GoogleLogin onSuccess={(res) => handleGoogleSuccess(res, 'attendee')} onError={() => toast.error('Google auth failed')} useOneTap={false} text="signin_with" shape="pill" />
                        </div>
                        <span className="auth-divider">or use your account</span>

                        <input className="auth-full-input" type="email" name="email" value={loginData.email} onChange={handleLoginChange} placeholder="Email" required />
                        <input className="auth-full-input" type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Password" required />

                        <Link to="/forgot-password" className="auth-forgot">Forgot your password?</Link>

                        <button className="btn btn-primary auth-submit-btn" type="submit">Sign In</button>
                    </form>
                </div>

                {/* OVERLAY PANEL */}
                <div className="auth-overlay-container">
                    <div className="auth-overlay">
                        <div className="auth-overlay-panel auth-overlay-left">
                            <h2>🎉 Welcome Back!</h2>
                            <p>Sign in to access your personalized event dashboard</p>
                            <button className="btn btn-outline overlay-btn" onClick={() => navigate('/login')}>Sign In</button>
                        </div>
                        <div className="auth-overlay-panel auth-overlay-right">
                            <h2>Create Account</h2>
                            <p>Join EventKonnect today</p>
                            <button className="btn btn-outline overlay-btn" onClick={() => navigate('/register')}>Sign Up</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Auth;
