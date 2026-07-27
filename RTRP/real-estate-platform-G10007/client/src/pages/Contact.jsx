function Contact() {
    return (
        <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <h1>Contact Us</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: '#a3a3a3', marginBottom: '2rem' }}>
                Have questions? We'd love to hear from you.
            </p>
            <div style={{ background: '#141414', padding: '2rem', borderRadius: '12px', display: 'inline-block', border: '1px solid #262626' }}>
                <p>Email: support@urbanova.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Luxury Lane, Beverly Hills, CA</p>
            </div>
        </div>
    );
}

export default Contact;
