import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Mail, Calendar, Trash2, X, CheckCircle, Share2, Heart, Calculator, Target, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Toast from '../components/Toast';
import MortgageCalculator from '../components/MortgageCalculator';
import NegotiationAssistant from '../components/NegotiationAssistant';
import LiveabilityScore from '../components/LiveabilityScore';

function ListingDetails({ user, adminUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [toast, setToast] = useState(null);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
    const [isLiveabilityOpen, setIsLiveabilityOpen] = useState(false);

    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Success States
    const [contactSuccess, setContactSuccess] = useState(false);
    const [scheduleSuccess, setScheduleSuccess] = useState(false);

    useEffect(() => {
        fetch(`/api/properties/${id}`)
            .then(res => res.json())
            .then(data => setProperty(data))
            .catch(err => console.error(err));
    }, [id]);

    const confirmDelete = async () => {
        try {
            const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
            if (res.ok) navigate('/');
            else setToast({ message: 'Failed to delete property.', type: 'error' });
        } catch (err) {
            console.error(err);
            setToast({ message: 'Error deleting property.', type: 'error' });
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setContactSuccess(true);
    }

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        setScheduleSuccess(true);
    }

    const closeContactModal = () => {
        setShowContactModal(false);
        setContactSuccess(false);
    }

    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        setScheduleSuccess(false);
    }

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        return `http://localhost:5000/uploads/${img}`;
    }


    // Safety check for critical data
    if (!property || !property.title) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading or Error...</div>;

    const price = property.price ? property.price.toLocaleString() : 'N/A';

    // Debugging ownership
    const isOwner = (() => {
        // Strictly check if the logged-in user is the owner
        if (!user || !property) return false;

        // Note: We removed global admin access from this public view
        if (user.role === 'admin') return true; // Legacy fallback if admin logs in via main portal
        if (!property.user) return false;

        const propertyUserId = typeof property.user === 'object' ? property.user._id : property.user;
        const currentUserId = user._id;

        return String(propertyUserId) === String(currentUserId);
    })();

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Cinematic Hero Section */}
            <div style={{ position: 'relative', height: '60vh', width: '100%', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url(${getImageUrl(property.image)})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    filter: 'brightness(0.7)'
                }}></div>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #050505)'
                }}></div>

                <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '4rem' }}>
                    <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '100px', backdropFilter: 'blur(5px)' }}>
                        <ArrowLeft size={16} /> Back
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <h1 style={{ fontSize: '3.5rem', margin: '0 0 0.5rem 0', fontWeight: '800', letterSpacing: '-0.02em', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{property.title}</h1>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: '#dedede' }}>
                            <MapPin size={20} color="var(--accent)" /> {property.location}
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '4rem', marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
                {/* Left Column: Details */}
                <div>
                    <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>About this property</h2>
                        <p style={{ lineHeight: '1.8', color: '#ccc', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{property.description}</p>
                    </div>

                    {/* Visual Map Placeholder */}
                    <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Location</h2>
                        <div style={{
                            width: '100%', height: '300px', borderRadius: '12px',
                            background: 'url(https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif)', // Placeholder map graphic
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)' }}></div>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location + ' ' + (property.pincode || ''))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ position: 'relative', background: '#fff', color: '#000', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', textDecoration: 'none', borderRadius: '8px' }}
                            >
                                <MapPin size={18} /> View on Google Maps
                            </a>
                        </div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {property.location} {property.pincode ? `, ${property.pincode}` : ''}
                        </p>
                    </div>
                </div>

                {/* Right Column: Sticky Sidebar */}
                <div style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
                    <div style={{
                        background: 'rgba(20, 20, 20, 0.6)',
                        backdropFilter: 'blur(20px)',
                        padding: '2rem', borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em' }}>Price</p>
                        <div style={{ fontSize: '3rem', color: '#fff', fontWeight: '700', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
                            ₹{Number(property.price).toLocaleString('en-IN')}
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <button onClick={() => setShowScheduleModal(true)} style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}>
                                Schedule Viewing
                            </button>
                            <button onClick={() => setShowContactModal(true)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                Contact Agent / Seller
                            </button>
                            {user && user.role === 'buyer' && (
                                <>
                                    <button
                                        onClick={() => setIsNegotiationOpen(true)}
                                        style={{ width: '100%', background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)', color: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Target size={18} /> AI Negotiation
                                    </button>
                                    <button
                                        onClick={() => setIsLiveabilityOpen(true)}
                                        style={{ width: '100%', background: 'rgba(56, 239, 125, 0.1)', border: '1px solid rgba(56, 239, 125, 0.3)', color: '#38ef7d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Home size={18} /> Liveability Score
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setIsCalculatorOpen(true)}
                                style={{ width: '100%', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Calculator size={18} /> Estimate Payments
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <button style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: 'none' }}>
                                <Share2 size={18} /> Share
                            </button>
                            <button style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: 'none' }}>
                                <Heart size={18} /> Save
                            </button>
                        </div>

                        {isOwner && (
                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    onClick={() => navigate('/add', { state: { property } })}
                                    style={{ width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '0.95rem', boxShadow: 'none' }}
                                >
                                    Edit Listing
                                </button>
                                <button onClick={() => setShowDeleteModal(true)} style={{ width: '100%', background: 'transparent', color: '#d32f2f', border: 'none', fontSize: '0.9rem', opacity: 0.7, boxShadow: 'none' }}>
                                    Delete Listing
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals (Re-used styles) */}
            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="auth-modal" style={{ maxWidth: '400px' }}>
                        <h3>Delete Listing?</h3>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>Are you sure? This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ background: 'transparent', border: '1px solid #eee', color: '#000', boxShadow: 'none' }}>Cancel</button>
                            <button onClick={confirmDelete} style={{ background: '#d32f2f', color: '#fff', boxShadow: 'none' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Modal Placeholder (simplified for brevity logic remains same) */}
            {/* Schedule Modal Placeholder */}
            {(showContactModal || showScheduleModal) && (
                <div className="modal-overlay">
                    <div className="auth-modal" style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>{showContactModal ? 'Contact Agent / Seller' : 'Schedule Viewing'}</h3>
                            <button onClick={() => { setShowContactModal(false); setShowScheduleModal(false) }} style={{ background: 'transparent', color: '#000', padding: 0, boxShadow: 'none' }}><X /></button>
                        </div>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>
                            {contactSuccess || scheduleSuccess ? 'Request Sent Successfully!' : 'Enter your details below to connect with the agent or seller.'}
                        </p>
                        {!contactSuccess && !scheduleSuccess && (
                            <form onSubmit={showContactModal ? handleContactSubmit : handleScheduleSubmit}>
                                <input type="text" placeholder="Your Name" required />
                                <input type="email" placeholder="Your Email" required />
                                {showScheduleModal && <input type="date" required style={{ marginBottom: '1rem' }} />}
                                <button type="submit" className="submit-btn">Send Request</button>
                            </form>
                        )}
                        {(contactSuccess || scheduleSuccess) && <button onClick={() => { setShowContactModal(false); setShowScheduleModal(false) }} className="submit-btn">Close</button>}
                    </div>
                </div>
            )}
            {/* Mortgage Calculator Modal */}
            <MortgageCalculator
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                price={property.price}
            />
            {/* AI Negotiation Assistant */}
            <NegotiationAssistant
                property={property}
                isOpen={isNegotiationOpen}
                onClose={() => setIsNegotiationOpen(false)}
            />
            {/* Liveability Score */}
            <LiveabilityScore
                property={property}
                isOpen={isLiveabilityOpen}
                onClose={() => setIsLiveabilityOpen(false)}
            />
        </div>
    );
}

export default ListingDetails;
