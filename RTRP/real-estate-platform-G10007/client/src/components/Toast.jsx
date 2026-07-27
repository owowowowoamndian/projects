import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const toastVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 }
};

const icons = {
    success: <CheckCircle size={20} color="#4caf50" />,
    error: <AlertCircle size={20} color="#e53935" />,
    info: <Info size={20} color="#2196f3" />
};

const colors = {
    success: '#4caf50',
    error: '#e53935',
    info: '#2196f3'
};

/**
 * Toast Component
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', or 'info'
 * @param {function} onClose - function to call when closing
 * @param {number} duration - duration in ms (default 3000)
 */
function Toast({ message, type = 'info', onClose, duration = 4000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            pointerEvents: 'none' // Allow clicks through the container
        }}>
            <AnimatePresence>
                {message && (
                    <motion.div
                        variants={toastVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{
                            background: '#1a1a1a',
                            border: `1px solid ${colors[type] || colors.info}`,
                            borderLeft: `4px solid ${colors[type] || colors.info}`,
                            borderRadius: '8px',
                            padding: '16px 20px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            minWidth: '300px',
                            maxWidth: '400px',
                            pointerEvents: 'auto', // Re-enable clicks
                            color: '#fff'
                        }}
                    >
                        <div style={{ flexShrink: 0 }}>
                            {icons[type] || icons.info}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.95rem', lineHeight: '1.4' }}>
                            {message}
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.color = '#fff'}
                            onMouseOut={(e) => e.target.style.color = '#666'}
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Toast;
