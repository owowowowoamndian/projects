import { useState } from 'react';
import { DollarSign, TrendingUp, Target, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function NegotiationAssistant({ property, isOpen, onClose }) {
    const [offerPrice, setOfferPrice] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const price = property?.price || 0;
    const suggestedMin = Math.floor(price * 0.85);
    const suggestedMax = Math.floor(price * 0.95);
    const marketValue = price;

    const analyzeOffer = () => {
        setLoading(true);
        const offer = parseInt(offerPrice);
        
        setTimeout(() => {
            const difference = marketValue - offer;
            const discountPercent = ((difference / marketValue) * 100).toFixed(1);
            
            let probability;
            let strategy;
            let counterOffer;

            if (offer >= marketValue) {
                probability = 95;
                strategy = "Strong acceptance likely. Seller sees a serious buyer.";
                counterOffer = null;
            } else if (offer >= suggestedMax) {
                probability = 70 + (offer - suggestedMax) / (marketValue - suggestedMax) * 20;
                strategy = "Good chance of acceptance. Present as pre-approved buyer.";
                counterOffer = null;
            } else if (offer >= suggestedMin) {
                probability = 50 + ((offer - suggestedMin) / (suggestedMax - suggestedMin)) * 30;
                strategy = "Moderate chance. Emphasize quick closure and cash payment.";
                counterOffer = Math.floor((suggestedMin + offer) / 2);
            } else {
                probability = Math.max(10, 40 - (suggestedMin - offer) / (suggestedMin * 0.1));
                strategy = "Low acceptance risk. Consider a more reasonable offer.";
                counterOffer = suggestedMin;
            }

            setAnalysis({
                offer,
                probability: Math.round(probability),
                discountPercent,
                strategy,
                counterOffer,
                suggestedRange: { min: suggestedMin, max: suggestedMax }
            });
            setLoading(false);
        }, 800);
    };

    const generateScript = () => {
        const scripts = [
            `"Hi, I've been looking at properties in this area and I'm genuinely interested in this one. I'm pre-approved and ready to close quickly. Would you be open to discussing a price of ${analysis?.offer?.toLocaleString()}?"`,
            `"I love this property, but based on recent market comparisons, I believe a fair price would be ${analysis?.offer?.toLocaleString()}. I'm flexible and ready to move fast if we can find common ground."`,
            `"This property checks most of our boxes. We'd like to offer ${analysis?.offer?.toLocaleString()} with a guaranteed 15-day closing. What would it take to make this work for you?"`
        ];
        return scripts[Math.floor(Math.random() * scripts.length)];
    };

    return (
        <div className="modal-overlay">
            <motion.div 
                className="auth-modal"
                style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '0.75rem', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Target size={24} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>AI Negotiation Assistant</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Smart offer calculator</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', padding: '0.5rem', boxShadow: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                {!analysis ? (
                    <>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem',
                            color: '#fff'
                        }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={18} /> Market Analysis
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                                Listed Price: <strong>₹{marketValue.toLocaleString()}</strong>
                            </p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                                Recommended Range: <strong>₹{suggestedMin.toLocaleString()} - ₹{suggestedMax.toLocaleString()}</strong>
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                                Enter Your Offer Price (₹)
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                    type="number" 
                                    value={offerPrice}
                                    onChange={(e) => setOfferPrice(e.target.value)}
                                    placeholder={`e.g., ${suggestedMin.toLocaleString()}`}
                                    style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                                />
                                <button 
                                    onClick={analyzeOffer}
                                    disabled={loading || !offerPrice}
                                    style={{ 
                                        padding: '0 1.5rem', 
                                        background: '#667eea',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {loading ? 'Analyzing...' : 'Analyze'}
                                </button>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                            background: '#f8f9fa', padding: '1rem', borderRadius: '8px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <DollarSign size={20} color="#667eea" />
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>Minimum</p>
                                <p style={{ margin: 0, fontWeight: '600' }}>₹{suggestedMin.toLocaleString()}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <DollarSign size={20} color="#f5576c" />
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>Maximum</p>
                                <p style={{ margin: 0, fontWeight: '600' }}>₹{suggestedMax.toLocaleString()}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <AnimatePresence>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '2rem', borderRadius: '12px', marginBottom: '1.5rem',
                                background: analysis.probability >= 70 ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' :
                                           analysis.probability >= 40 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                                           'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                                color: '#fff'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>Acceptance Probability</p>
                                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '3rem', fontWeight: '800' }}>
                                        {analysis.probability}%
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Your Offer</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#f8f9fa', textAlign: 'center'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Your Offer</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600' }}>₹{analysis.offer.toLocaleString()}</p>
                                    </div>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#f8f9fa', textAlign: 'center'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Discount</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: analysis.discountPercent > 0 ? '#38ef7d' : '#eb3349' }}>
                                            {analysis.discountPercent}%
                                        </p>
                                    </div>
                                    <div style={{ 
                                        padding: '1rem', borderRadius: '8px', 
                                        background: '#f8f9fa', textAlign: 'center'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Listed Price</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600' }}>₹{marketValue.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ 
                                padding: '1rem', borderRadius: '8px', 
                                background: '#fff3cd', border: '1px solid #ffc107',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    💡 Strategy
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>{analysis.strategy}</p>
                            </div>

                            {analysis.counterOffer && (
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', 
                                    background: '#e8f5e9', border: '1px solid #4caf50',
                                    marginBottom: '1.5rem'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        🤝 Suggested Counter
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#2e7d32' }}>
                                        Consider offering <strong>₹{analysis.counterOffer.toLocaleString()}</strong> for better odds
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MessageSquare size={18} /> Negotiation Script
                                </h4>
                                <div style={{ 
                                    padding: '1rem', borderRadius: '8px', 
                                    background: '#f8f9fa', fontStyle: 'italic', fontSize: '0.9rem',
                                    lineHeight: '1.6'
                                }}>
                                    {generateScript()}
                                </div>
                            </div>

                            <button 
                                onClick={() => setAnalysis(null)}
                                style={{ width: '100%', padding: '1rem', background: '#6c757d', color: '#fff' }}
                            >
                                Try Another Offer
                            </button>
                        </motion.div>
                    </AnimatePresence>
                )}
            </motion.div>
        </div>
    );
}

export default NegotiationAssistant;