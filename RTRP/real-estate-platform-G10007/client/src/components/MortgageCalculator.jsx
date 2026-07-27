import { useState, useEffect } from 'react';
import { DollarSign, Percent, Calculator, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function MortgageCalculator({ isOpen, onClose, price }) {
    const [loanAmount, setLoanAmount] = useState(price);
    const [downPayment, setDownPayment] = useState(price * 0.2);
    const [interestRate, setInterestRate] = useState(6.5);
    const [loanTerm, setLoanTerm] = useState(30);
    const [monthlyPayment, setMonthlyPayment] = useState(0);

    useEffect(() => {
        calculateMortgage();
    }, [loanAmount, downPayment, interestRate, loanTerm, price]);

    // Update loan amount if property price changes and form hasn't been touched yet (optional behavior)
    // For simplicity, we just initialize.

    const calculateMortgage = () => {
        const principal = loanAmount - downPayment;
        const monthlyInterest = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        if (principal <= 0) {
            setMonthlyPayment(0);
            return;
        }

        const mortgage =
            (principal * monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) /
            (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);

        setMonthlyPayment(isFinite(mortgage) ? mortgage : 0);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
                    backdropFilter: 'blur(5px)'
                }}
            >
                <motion.div
                    initial={{ y: 50, scale: 0.9 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 50, scale: 0.9 }}
                    style={{
                        background: '#1a1a1a',
                        padding: '2rem',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '500px',
                        border: '1px solid var(--accent)',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '0.8rem', borderRadius: '12px', marginRight: '1rem' }}>
                            <Calculator size={32} color="var(--accent)" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Mortgage Calculator</h2>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#888' }}>Estimate your monthly payments</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Property Price</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="number"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                                    style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: '#fff', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Down Payment</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(Number(e.target.value))}
                                    style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: '#fff', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Interest Rate</label>
                            <div style={{ position: 'relative' }}>
                                <Percent size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: '#fff', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Loan Term (Years)</label>
                            <select
                                value={loanTerm}
                                onChange={(e) => setLoanTerm(Number(e.target.value))}
                                style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem', color: '#fff', outline: 'none' }}
                            >
                                <option value="15">15 Years</option>
                                <option value="20">20 Years</option>
                                <option value="30">30 Years</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)', padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)' }}>
                        <p style={{ margin: 0, color: '#000', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>Estimated Monthly Payment</p>
                        <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '3rem', color: '#000', fontWeight: '800' }}>
                            ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h2>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default MortgageCalculator;
