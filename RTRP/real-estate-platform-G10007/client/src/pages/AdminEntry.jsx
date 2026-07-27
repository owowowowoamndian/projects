import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Mail, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminEntry({ onAdminLogin }) {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'admin' // Forced role
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? 'login' : 'register';

        try {
            const res = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) {
                const errorMessage = typeof data === 'string' ? data : (data.message || data.error || 'Authentication failed');
                throw new Error(errorMessage);
            }

            // Double check role for login
            if (isLogin && data.role !== 'admin') {
                throw new Error("Access Denied. Not an Admin account.");
            }

            localStorage.setItem('adminUser', JSON.stringify(data));
            onAdminLogin(data);
            navigate('/admin'); // Redirect straight to dashboard
        } catch (err) {
            setError(err.message || 'Authentication failed');
        }
    }

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: '400px', padding: '3rem', background: '#111', borderRadius: '16px', border: '1px solid #333' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <ShieldAlert size={48} color="#d32f2f" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>Restricted Access</h1>
                    <p style={{ color: '#666' }}>Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-with-icon">
                        <User size={18} />
                        <input name="username" placeholder="Admin Username" required onChange={handleChange} style={{ background: '#222', border: '1px solid #333', color: '#fff' }} />
                    </div>

                    {!isLogin && (
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input name="email" type="email" placeholder="Admin Email" required onChange={handleChange} style={{ background: '#222', border: '1px solid #333', color: '#fff' }} />
                        </div>
                    )}

                    <div className="input-with-icon">
                        <Lock size={18} />
                        <input name="password" type="password" placeholder="Password" required onChange={handleChange} style={{ background: '#222', border: '1px solid #333', color: '#fff' }} />
                    </div>

                    {error && <p style={{ color: '#d32f2f', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

                    <button type="submit" style={{ background: '#d32f2f', color: '#fff', padding: '1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isLogin ? 'Access Dashboard' : 'Register Admin'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}>
                        {isLogin ? 'Need to register a new admin?' : 'Back to Login'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default AdminEntry;
