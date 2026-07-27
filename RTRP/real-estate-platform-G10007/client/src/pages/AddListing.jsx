import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Sparkles } from 'lucide-react';
import Toast from '../components/Toast';

function AddListing() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are in edit mode
    const editingProperty = location.state?.property || null;
    const isEditMode = !!editingProperty;

    const [formData, setFormData] = useState({
        title: editingProperty?.title || '',
        description: editingProperty?.description || '',
        price: editingProperty?.price || '',
        location: editingProperty?.location || '',
        pincode: editingProperty?.pincode || '',
    });

    const [file, setFile] = useState(null);
    const [imageURL, setImageURL] = useState(editingProperty?.image || '');
    const [toast, setToast] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleURLChange = (e) => {
        setImageURL(e.target.value);
    }

    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(-1);

    const handleAI = async () => {
        // If we already have suggestions, cycle through them
        if (aiSuggestions.length > 0) {
            const nextIndex = (currentSuggestionIndex + 1) % aiSuggestions.length;
            setCurrentSuggestionIndex(nextIndex);
            setFormData(prev => ({ ...prev, description: aiSuggestions[nextIndex] }));
            return;
        }

        // Otherwise fetch new ones
        try {
            const res = await fetch('/api/properties/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: formData.title, location: formData.location, price: formData.price })
            });
            const data = await res.json();

            if (data.descriptions && data.descriptions.length > 0) {
                setAiSuggestions(data.descriptions);
                setCurrentSuggestionIndex(0);
                setFormData(prev => ({ ...prev, description: data.descriptions[0] }));
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('location', formData.location);
        data.append('pincode', formData.pincode || '');

        if (file) {
            data.append('image', file);
        } else if (imageURL) {
            data.append('image', imageURL);
        }

        // Append User ID
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id) {
            data.append('user', user._id);
        }

        try {
            const apiUrl = isEditMode ? `/api/properties/${editingProperty._id}` : '/api/properties';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(apiUrl, {
                method: method,
                // headers: { 'Content-Type': 'multipart/form-data' }, // Fetch handles multipart automatically
                body: data,
            });
            if (res.ok) {
                navigate(isEditMode ? `/property/${editingProperty._id}` : '/');
            } else {
                console.error(`Failed to ${isEditMode ? 'update' : 'add'} listing`);
                setToast({ message: `Failed to ${isEditMode ? 'update' : 'publish'} listing. Check console.`, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setToast({ message: `Error ${isEditMode ? 'updating' : 'publishing'} listing.`, type: 'error' });
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', paddingTop: '100px', paddingBottom: '50px' }}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <h1 style={{ marginBottom: '2rem' }}>{isEditMode ? 'Edit Property Listing' : 'List Your Property'}</h1>
            <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border)' }}>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Property Title</label>
                    <input name="title" placeholder="e.g. Modern Penthouse in Downtown" value={formData.title} onChange={handleChange} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Price (₹)</label>
                        <input name="price" type="number" placeholder="10000000" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Location</label>
                        <input name="location" placeholder="e.g. Jubilee Hills, Hyderabad" value={formData.location} onChange={handleChange} required />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pincode / Zip Code</label>
                    <input name="pincode" placeholder="e.g. 500033" value={formData.pincode} onChange={handleChange} required style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Image</label>

                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <div style={{ position: 'relative' }}>
                            <input type="text" placeholder="https://example.com/image.jpg (or upload below)" value={imageURL} onChange={handleURLChange} style={{ paddingLeft: '3rem' }} />
                            <Upload size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-secondary)' }} />
                        </div>

                        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                            <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>OR Upload File (Overrides URL)</p>
                            <input type="file" onChange={handleFileChange} style={{ border: 'none', padding: 0 }} />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ color: 'var(--text-secondary)' }}>Description</label>
                        <button type="button" onClick={handleAI} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                            <Sparkles size={14} /> AI Generate
                        </button>
                    </div>
                    <textarea name="description" placeholder="Describe the property..." rows="6" value={formData.description} onChange={handleChange} required style={{ width: '100%' }} />
                </div>

                <button type="submit" style={{ width: '100%' }}>
                    {isEditMode ? 'Update Listing' : 'Publish Listing'}
                </button>
            </form>
        </div>
    );
}

export default AddListing;
