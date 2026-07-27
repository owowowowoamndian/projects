import React, { useState, useEffect } from 'react';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const adminUserStr = localStorage.getItem('adminUser');
                const userStr = localStorage.getItem('user');
                let token = null;
                if (adminUserStr) token = JSON.parse(adminUserStr).token;
                if (!token && userStr) token = JSON.parse(userStr).token;

                if (!token) {
                    setError('No token found. Please log in.');
                    setLoading(false);
                    return;
                }

                const res = await fetch('/api/logs', {
                    headers: {
                        'token': token
                    }
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Server Error: ${res.status} - ${errorText}`);
                }

                const data = await res.json();
                setLogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) return <div className="text-gray-400">Loading activity logs...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            {logs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No activity logs found.</p>
            ) : (
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                                <th style={{ padding: '1rem' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                                        {log.user?.username || 'Unknown User'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            background: log.user?.role === 'admin' ? 'var(--accent)' : '#333',
                                            color: log.user?.role === 'admin' ? '#000' : '#fff',
                                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem'
                                        }}>
                                            {log.user?.role || 'Deleted'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{log.action}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;
