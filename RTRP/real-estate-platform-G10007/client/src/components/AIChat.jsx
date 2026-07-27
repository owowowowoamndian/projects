import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your Urbanova AI assistant. Ask me to find properties like '2BHK in Hyderabad under 50 lakhs'.", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [properties, setProperties] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load properties for AI context
        fetch('/api/properties')
            .then(res => res.json())
            .then(data => setProperties(data))
            .catch(err => console.error(err));
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // AI Logic
        setTimeout(() => {
            const response = generateAIResponse(input, properties);
            setMessages(prev => [...prev, { text: response, sender: 'ai' }]);
        }, 1000);
    };

    const generateAIResponse = (query, props) => {
        const lowerQuery = query.toLowerCase();

        // Handle Greetings
        if (['hi', 'hello', 'hey', 'greetings', 'sup'].some(word => lowerQuery.includes(word)) && lowerQuery.length < 20) {
            return "Hello! How can I help you find your dream home today?";
        }

        let matches = props;

        // Simple Keyword Matching
        if (lowerQuery.includes('hyderabad')) matches = matches.filter(p => p.location.toLowerCase().includes('hyderabad'));
        if (lowerQuery.includes('mumbai')) matches = matches.filter(p => p.location.toLowerCase().includes('mumbai'));
        if (lowerQuery.includes('bangalore')) matches = matches.filter(p => p.location.toLowerCase().includes('bangalore'));

        // Price Parse (Basic)
        if (lowerQuery.includes('under')) {
            if (lowerQuery.includes('300k') || lowerQuery.includes('300,000')) matches = matches.filter(p => p.price <= 300000);
            if (lowerQuery.includes('500k') || lowerQuery.includes('500,000')) matches = matches.filter(p => p.price <= 500000);
            if (lowerQuery.includes('1m') || lowerQuery.includes('1 million')) matches = matches.filter(p => p.price <= 1000000);
        }

        if (matches.length === 0) {
            return "I couldn't find any properties matching your exact criteria. Try broadening your search or ask for 'all properties'.";
        }

        if (matches.length === props.length && !lowerQuery.includes('all')) {
            return "I'm not sure what you're looking for yet. You can ask for 'properties in Mumbai' or 'under $500k'. Or just type 'all' to see everything!";
        }

        const names = matches.slice(0, 3).map(p => p.title).join(", ");
        const countMsg = matches.length > 3 ? ` and ${matches.length - 3} more` : "";
        return `I found ${matches.length} properties for you, including: ${names}${countMsg}. Check the Properties page for details!`;
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className="ai-chat-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={48} strokeWidth={2.5} /> : <Bot size={48} strokeWidth={2.5} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="chat-header">
                        <h3>Urbanova AI</h3>
                        <span className="online-indicator"></span>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.sender}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}><Send size={16} /></button>
                    </div>
                </div>
            )}
        </>
    );
}

export default AIChat;
