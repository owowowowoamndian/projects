import { useState, useEffect } from 'react';
import { MapPin, X, Activity, Shield, Car, School, Hospital, Dumbbell, Home, Train } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function LiveabilityScore({ property, isOpen, onClose }) {
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        
        setLoading(true);
        const timer = setTimeout(() => {
            const baseScore = 72;
            const locationFactor = property?.location?.toLowerCase().includes('central') ? 15 : 
                                   property?.location?.toLowerCase().includes('north') ? 10 : 5;
            
            const amenities = {
                hospitals: { count: Math.floor(Math.random() * 5) + 1, distance: Math.floor(Math.random() * 3) + 1 },
                schools: { count: Math.floor(Math.random() * 8) + 2, distance: Math.floor(Math.random() * 5) + 1 },
                gyms: { count: Math.floor(Math.random() * 6) + 1, distance: Math.floor(Math.random() * 2) + 1 },
                metro: { count: Math.random() > 0.5 ? 1 : 0, distance: Math.floor(Math.random() * 5) + 1 },
                parks: { count: Math.floor(Math.random() * 4) + 1, distance: Math.floor(Math.random() * 3) + 1 }
            };

            const amenitiesScore = Math.min(100, 
                (amenities.hospitals.count > 0 ? 20 : 0) +
                (amenities.schools.count > 2 ? 20 : 0) +
                (amenities.gyms.count > 0 ? 15 : 0) +
                (amenities.metro.count > 0 ? 25 : 0) +
                (amenities.parks.count > 0 ? 20 : 0)
            );

            const noiseLevel = ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)];
            const trafficDensity = ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)];
            const crimeRate = ['Very Safe', 'Safe', 'Moderate'][Math.floor(Math.random() * 3)];

            const totalScore = Math.round((baseScore + locationFactor + amenitiesScore) / 2.5);

            setScore({
                overall: Math.min(95, totalScore),
                noiseLevel,
                trafficDensity,
                crimeRate,
                amenities,
                breakdown: [
                    { label: 'Healthcare Access', score: amenities.hospitals.count > 0 ? 85 + Math.random() * 15 : 40 + Math.random() * 20 },
                    { label: 'Education', score: amenities.schools.count > 2 ? 80 + Math.random() * 20 : 50 + Math.random() * 20 },
                    { label: 'Fitness & Recreation', score: amenities.gyms.count > 0 ? 75 + Math.random() * 20 : 45 + Math.random() * 15 },
                    { label: 'Connectivity', score: amenities.metro.count > 0 ? 90 + Math.random() * 10 : 60 + Math.random() * 20 },
                    { label: 'Green Spaces', score: amenities.parks.count > 0 ? 80 + Math.random() * 15 : 50 + Math.random() * 20 },
                ]
            });
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [property, isOpen]);

    const getScoreColor = (score) => {
        if (score >= 80) return '#38ef7d';
        if (score >= 60) return '#f093fb';
        return '#eb3349';
    };

    const getScoreGrade = (score) => {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        return 'D';
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <motion.div 
                className="auth-modal"
                style={{ maxWidth: '650px', maxHeight: '90vh', overflow: 'auto' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            padding: '0.75rem', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Home size={24} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>Liveability Score</h3>
                            <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>Lifestyle quality analysis</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none', color: '#888' }}>
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ 
                            width: '50px', height: '50px', border: '3px solid #333',
                            borderTop: '3px solid #38ef7d', borderRadius: '50%',
                            animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
                        }} />
                        <p style={{ color: '#888' }}>Analyzing neighborhood...</p>
                    </div>
                ) : score && (
                    <AnimatePresence>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '2rem', borderRadius: '16px', marginBottom: '1.5rem',
                                background: '#1a1a1a',
                                border: `2px solid ${getScoreColor(score.overall)}`
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '1rem', color: '#888' }}>Overall Score</p>
                                    <div style={{ 
                                        fontSize: '4rem', fontWeight: '800', 
                                        color: getScoreColor(score.overall),
                                        lineHeight: 1
                                    }}>
                                        {score.overall}
                                    </div>
                                    <div style={{ 
                                        fontSize: '1.5rem', fontWeight: '600', 
                                        color: getScoreColor(score.overall)
                                    }}>
                                        Grade {getScoreGrade(score.overall)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ 
                                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', 
                                gap: '0.75rem', marginBottom: '1.5rem'
                            }}>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', background: '#1a1a1a',
                                    textAlign: 'center', border: '1px solid #333'
                                }}>
                                    <Activity size={20} color="#667eea" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Noise</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>{score.noiseLevel}</p>
                                </div>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', background: '#1a1a1a',
                                    textAlign: 'center', border: '1px solid #333'
                                }}>
                                    <Car size={20} color="#f5576c" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Traffic</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>{score.trafficDensity}</p>
                                </div>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', background: '#1a1a1a',
                                    textAlign: 'center', border: '1px solid #333'
                                }}>
                                    <Shield size={20} color="#38ef7d" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Safety</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>{score.crimeRate}</p>
                                </div>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', background: '#1a1a1a',
                                    textAlign: 'center', border: '1px solid #333'
                                }}>
                                    <MapPin size={20} color="#764ba2" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Connectivity</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>Good</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#fff' }}>Nearby Amenities</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#1a1a1a', border: '1px solid #333',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}>
                                        <div style={{ background: '#2a1a1a', padding: '0.75rem', borderRadius: '8px' }}>
                                            <Hospital size={20} color="#ef5350" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Hospitals</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#fff' }}>
                                                {score.amenities.hospitals.count} within {score.amenities.hospitals.distance}km
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#1a1a1a', border: '1px solid #333',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}>
                                        <div style={{ background: '#1a2a3a', padding: '0.75rem', borderRadius: '8px' }}>
                                            <School size={20} color="#42a5f5" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Schools</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#fff' }}>
                                                {score.amenities.schools.count} within {score.amenities.schools.distance}km
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#1a1a1a', border: '1px solid #333',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}>
                                        <div style={{ background: '#2a1a2a', padding: '0.75rem', borderRadius: '8px' }}>
                                            <Dumbbell size={20} color="#ec407a" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Gyms</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#fff' }}>
                                                {score.amenities.gyms.count} within {score.amenities.gyms.distance}km
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#1a1a1a', border: '1px solid #333',
                                        display: 'flex', alignItems: 'center', gap: '1rem'
                                    }}>
                                        <div style={{ background: '#1a2a1a', padding: '0.75rem', borderRadius: '8px' }}>
                                            <Train size={20} color="#66bb6a" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Metro</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#fff' }}>
                                                {score.amenities.metro.count > 0 ? `1 within ${score.amenities.metro.distance}km` : 'Not nearby'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#fff' }}>Score Breakdown</h4>
                                {score.breakdown.map((item, index) => (
                                    <div key={index} style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#888' }}>{item.label}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>{Math.round(item.score)}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${item.score}%`, height: '100%',
                                                background: getScoreColor(item.score),
                                                borderRadius: '4px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </motion.div>
        </div>
    );
}

export default LiveabilityScore;