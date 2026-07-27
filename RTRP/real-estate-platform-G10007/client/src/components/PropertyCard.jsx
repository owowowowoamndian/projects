import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

function PropertyCard({ property }) {
    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        return `http://localhost:5000/uploads/${img}`;
    };

    const handleImageError = (e) => {
        e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
    };

    return (
        <Link to={`/property/${property._id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
            <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                {property.image ? (
                    <img
                        src={getImageUrl(property.image)}
                        alt={property.title}
                        onError={handleImageError}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                        No Image
                    </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px', boxSizing: 'border-box' }}>
                    <p className="price" style={{ marginBottom: 0 }}>₹{property.price.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="card-content">
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.title}</h3>
                <p className="location" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <MapPin size={14} color="var(--accent)" /> {property.location}
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.2s' }}>
                        View Details <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default PropertyCard;
