import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const TypingText = ({ text, className, delay = 0 }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedText(text.substring(0, i + 1));
                i++;
                if (i === text.length) clearInterval(interval);
            }, 100); // Speed of typing

            return () => clearInterval(interval);
        }, delay * 1000);

        return () => clearTimeout(timeout);
    }, [text, delay]);

    return (
        <motion.span
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {displayedText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
            >
                |
            </motion.span>
        </motion.span>
    );
};

export default TypingText;
