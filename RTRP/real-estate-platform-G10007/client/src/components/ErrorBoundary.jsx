import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: '#ff4444', backgroundColor: '#111', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ccc' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '2rem', padding: '1rem 2rem', background: 'var(--accent)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
