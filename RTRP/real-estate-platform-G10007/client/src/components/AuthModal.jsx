import { useState } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';

function AuthModal({ onClose, onLogin, initialView = 'login', defaultRole = 'buyer' }) {
    const [isLogin, setIsLogin] = useState(initialView === 'login');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: defaultRole
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? 'login' : 'register';

        // Frontend guard: block 'admin' username registration
        if (!isLogin && formData.username.toLowerCase() === 'admin') {
            setError("The username 'admin' is reserved. Please choose another.");
            return;
        }

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

            localStorage.setItem('user', JSON.stringify(data));
            onLogin(data);
            onClose();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        }
    }

    return (
        <div className="modal-overlay">
            <div className="auth-modal">
                <button className="close-btn" onClick={onClose}><X size={20} /></button>

                <div className="auth-header">
                    <h2>Urbanova.</h2>
                    <p>{isLogin ? 'Welcome Back' : 'Join the Community'}</p>
                </div>

                <div className="auth-tabs">
                    <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
                    <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Register</button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <User size={18} />
                        <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <Mail size={18} />
                            <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
                        </div>
                    )}

                    <div className="input-group">
                        <Lock size={18} />
                        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                    </div>

                    {!isLogin && (
                        <div className="role-select">
                            <label>I am a:</label>
                            <div className="role-options">
                                <label className={formData.role === 'buyer' ? 'selected' : ''}>
                                    <input type="radio" name="role" value="buyer" checked={formData.role === 'buyer'} onChange={handleChange} />
                                    Buyer
                                </label>
                                <label className={formData.role === 'seller' ? 'selected' : ''}>
                                    <input type="radio" name="role" value="seller" checked={formData.role === 'seller'} onChange={handleChange} />
                                    Seller
                                </label>
                                <label className={formData.role === 'agent' ? 'selected' : ''}>
                                    <input type="radio" name="role" value="agent" checked={formData.role === 'agent'} onChange={handleChange} />
                                    Agent
                                </label>
                            </div>
                        </div>
                    )}

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="submit-btn">
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthModal;
