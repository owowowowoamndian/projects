import { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from './Toast';

function Footer() {
    const [toast, setToast] = useState(null); // { message, type }

    const handleSubscribe = (e) => {
        e.preventDefault();
        setToast({ message: "Thanks for subscribing!", type: "success" });
    };

    return (
        <footer className="footer">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="container footer-content">
                <div className="footer-brand">
                    <Link to="/" className="logo">Urbanova.</Link>
                    <p>Premium Real Estate Marketplace.</p>
                </div>

                <div className="footer-links">
                    <div className="link-group">
                        <h4>Platform</h4>
                        <Link to="/">Home</Link>
                        <Link to="/properties">Properties</Link>
                        <Link to="/add">List Property</Link>
                    </div>
                    <div className="link-group">
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                        <Link to="/careers">Careers</Link>
                        <Link to="/contact">Contact</Link>
                    </div>

                    <div className="link-group" style={{ maxWidth: '300px' }}>
                        <h4>Stay Connected</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Subscribe to our newsletter for the latest premium listings.
                        </p>
                        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    flex: 1,
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.9rem',
                                    boxShadow: 'none',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="footer-bottom container">
                <p>&copy; 2024 Estate Platform. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
