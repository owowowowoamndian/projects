import { motion } from 'framer-motion';

function AdminAnalytics({ stats, users, properties }) {
    // 1. Calculate User Roles Distribution
    const userRoles = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    const totalUsers = users.length || 1; // Avoid division by zero
    const roleData = [
        { label: 'Buyers', value: userRoles.buyer || 0, color: '#4caf50' },
        { label: 'Sellers', value: userRoles.seller || 0, color: '#2196f3' },
        { label: 'Admins', value: userRoles.admin || 0, color: '#d4af37' },
    ];

    // 2. Property Price Ranges (Mock bins)
    const priceRanges = {
        'Low (<$100k)': 0,
        'Mid ($100k-$500k)': 0,
        'High ($500k-$1M)': 0,
        'Luxury (>$1M)': 0
    };

    properties.forEach(p => {
        if (p.price < 100000) priceRanges['Low (<$100k)']++;
        else if (p.price < 500000) priceRanges['Mid ($100k-$500k)']++;
        else if (p.price < 1000000) priceRanges['High ($500k-$1M)']++;
        else priceRanges['Luxury (>$1M)']++;
    });

    const maxProperties = Math.max(...Object.values(priceRanges), 1);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>

            {/* User Distribution - Donut Chart */}
            <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>User Distribution</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                    <svg width="200" height="200" viewBox="0 0 100 100">
                        {(() => {
                            let cumulativePercent = 0;
                            return roleData.map((role, i) => {
                                const percent = role.value / totalUsers;
                                const startAngle = cumulativePercent * Math.PI * 2;
                                cumulativePercent += percent;
                                const endAngle = cumulativePercent * Math.PI * 2;

                                const x1 = 50 + 40 * Math.cos(startAngle);
                                const y1 = 50 + 40 * Math.sin(startAngle);
                                const x2 = 50 + 40 * Math.cos(endAngle);
                                const y2 = 50 + 40 * Math.sin(endAngle);

                                const largeArcFlag = percent > 0.5 ? 1 : 0;

                                // Handle single item case (full circle)
                                const pathData = percent === 1
                                    ? `M 50 10 A 40 40 0 1 1 49.99 10`
                                    : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                                return (
                                    <path
                                        key={role.label}
                                        d={pathData}
                                        fill={role.color}
                                        stroke="#111"
                                        strokeWidth="1"
                                    />
                                );
                            });
                        })()}
                        <circle cx="50" cy="50" r="20" fill="#111" />
                    </svg>
                    <div style={{ marginLeft: '2rem' }}>
                        {roleData.map(role => (
                            <div key={role.label} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <div style={{ width: '12px', height: '12px', background: role.color, marginRight: '0.5rem', borderRadius: '2px' }}></div>
                                <span style={{ color: '#ccc' }}>{role.label}: {role.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Property Price Ranges - Bar Chart */}
            <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>Listing Price Ranges</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    {Object.entries(priceRanges).map(([label, count]) => {
                        const heightPercent = (count / maxProperties) * 100;
                        return (
                            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                                <div style={{ height: '150px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #333' }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            width: '80%',
                                            background: 'var(--accent)',
                                            borderRadius: '4px 4px 0 0',
                                            minHeight: '4px',
                                            opacity: 0.8
                                        }}
                                    />
                                </div>
                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{count}</span>
                                <span style={{ color: '#666', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem' }}>
                                    {label.split(' ')[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;
