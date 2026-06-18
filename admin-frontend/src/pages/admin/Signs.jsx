import { useEffect, useState, useMemo, useRef } from 'react';
import api from '../../services/api';

const DEFAULT_FORM = {
  signName: '',
  description: '',
  videoUrl: '',
  imageUrl: '',
};

export default function Signs() {
  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSign, setEditingSign] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [selectedSign, setSelectedSign] = useState(null);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [userMap, setUserMap] = useState({});

  // Upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Preview
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const videoPreviewRef = useRef(null);

  // Media viewer
  const [viewingSign, setViewingSign] = useState(null);   // the sign being viewed
  const [viewingType, setViewingType] = useState('video'); // 'video' or 'image'

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.userId;
  const currentUserFullName = currentUser.fullName || 'You';

  // Auto‑dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [signsRes, usersRes] = await Promise.all([
        api.get('/admin/signs'),
        api.get('/admin/users'),
      ]);
      setSigns(Array.isArray(signsRes.data) ? signsRes.data : []);
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const map = {};
      users.forEach((u) => { map[u.userId] = u.fullName; });
      setUserMap(map);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load signs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredSigns = useMemo(() => {
    if (!searchTerm.trim()) return signs;
    const term = searchTerm.toLowerCase();
    return signs.filter(
      (s) =>
        s.signName?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
    );
  }, [signs, searchTerm]);

  const handleDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await api.delete(`/signs/${deleteTargetId}`);
      setSigns((prev) => prev.filter((s) => s.signId !== deleteTargetId));
      setToast({ message: 'Sign deleted!', type: 'success' });
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      signName: form.signName,
      description: form.description,
      videoUrl: form.videoUrl,
      imageUrl: form.imageUrl,
    };

    try {
      if (editingSign) {
        await api.put(`/signs/${editingSign.signId}`, payload);
        setToast({ message: 'Sign updated!', type: 'success' });
      } else {
        await api.post('/admin/signs', payload);
        setToast({ message: 'Sign created!', type: 'success' });
      }
      setShowForm(false);
      setEditingSign(null);
      setForm(DEFAULT_FORM);
      setVideoPreviewUrl(null);
      fetchData();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        err.message ||
        'An unknown error occurred';
      setErrorModalMessage(message);
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingSign(null);
    setShowForm(false);
    setVideoPreviewUrl(null);
  };

  const openEdit = (sign) => {
    setEditingSign(sign);
    setForm({
      signName: sign.signName || '',
      description: sign.description || '',
      videoUrl: sign.videoUrl || '',
      imageUrl: sign.imageUrl || '',
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingSign(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper to build absolute media URL
  const getMediaUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://localhost:8085${path}`;
  };

  // ── Video file selection with preview ──
  const handleVideoFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    const localUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(localUrl);

    handleVideoUpload(file);
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      const { data } = await api.post('/signs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, videoUrl: data.url }));
      setToast({ message: 'Video uploaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Video upload failed', type: 'error' });
    } finally {
      setUploadingVideo(false);
    }
  };

  // Capture a frame from the video preview and upload as thumbnail
  const captureThumbnail = async () => {
    const video = videoPreviewRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('file', blob, 'thumbnail.jpg');
        formData.append('type', 'image');
        const { data } = await api.post('/signs/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
        setToast({ message: 'Thumbnail captured!', type: 'success' });
      } catch (err) {
        setToast({ message: 'Thumbnail upload failed', type: 'error' });
      } finally {
        setUploadingImage(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      const { data } = await api.post('/signs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
      setToast({ message: 'Image uploaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Image upload failed', type: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Helpers ──
  const getCreatorDisplay = (createdBy) => {
    if (!createdBy && createdBy !== 0) return '—';
    const fullName = userMap[createdBy] || null;
    if (!fullName) return `User #${createdBy}`;
    const parts = fullName.trim().split(' ');
    if (parts.length > 1) return parts[parts.length - 1];
    return truncate(fullName, 7);
  };

  const getCreatorNameForForm = (sign) => {
    if (!sign) return currentUserFullName;
    const name = userMap[sign.createdBy] || `User #${sign.createdBy}`;
    if (sign.createdBy === currentUserId) return 'You';
    return name;
  };

  const truncate = (text, maxLen = 7) => {
    if (!text || typeof text !== 'string') return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '…' : text;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: '#0A2956', fontWeight: 700 }}>Signs</h2>
        <button
          onClick={() => showForm ? resetForm() : openCreate()}
          style={{
            padding: '0.6rem 1.5rem',
            background: '#0A2956',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {showForm ? 'Close Form' : '+ Add Sign'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#FFF0F0', color: '#B00020', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid #FFCDD2' }}>
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit}
          style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px',
            padding: '1.5rem', marginBottom: '2rem', display: 'grid',
            gridTemplateColumns: '1fr 1fr', gap: '1rem',
          }}
        >
          <input name="signName" value={form.signName} onChange={handleChange} placeholder="Sign name (e.g. Thank You)" required style={inputStyle} />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description"
            rows={2}
            required
            style={{ ...inputStyle, gridColumn: 'span 2', resize: 'vertical' }}
          />

          {/* Video upload with preview */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontWeight: 500, color: '#0A2956', display: 'block', marginBottom: '0.5rem' }}>Video</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => videoInputRef.current.click()} disabled={uploadingVideo} style={uploadButtonStyle}>
                {uploadingVideo ? 'Uploading...' : 'Choose Video'}
              </button>
              <input type="file" ref={videoInputRef} onChange={handleVideoFileSelect} accept="video/*" style={{ display: 'none' }} />
              {form.videoUrl && !uploadingVideo && (
                <span style={{ color: '#135290', fontSize: '0.9rem' }}>
                  ✓ Uploaded
                </span>
              )}
            </div>
            {videoPreviewUrl && (
              <div style={{ marginTop: '0.75rem', position: 'relative' }}>
                <video
                  ref={videoPreviewRef}
                  src={videoPreviewUrl}
                  controls
                  style={{ width: '100%', maxHeight: '200px', borderRadius: '8px', background: '#000' }}
                />
                <button
                  type="button"
                  onClick={captureThumbnail}
                  disabled={uploadingImage}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.3rem 0.8rem',
                    background: '#0A2956',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Capture Thumbnail from Current Frame
                </button>
              </div>
            )}
          </div>

          {/* Image upload */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontWeight: 500, color: '#0A2956', display: 'block', marginBottom: '0.5rem' }}>Image / Thumbnail</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => imageInputRef.current.click()} disabled={uploadingImage} style={uploadButtonStyle}>
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </button>
              <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
              {form.imageUrl && (
                <span style={{ color: '#135290', fontSize: '0.9rem' }}>
                  ✓ Thumbnail ready
                </span>
              )}
            </div>
            {form.imageUrl && (
              <img
                src={getMediaUrl(form.imageUrl)}
                alt="Thumbnail"
                style={{ width: '100px', borderRadius: '8px', marginTop: '0.5rem' }}
              />
            )}
          </div>

          {/* Read‑only creator field */}
          <div style={{ gridColumn: 'span 2', fontSize: '0.9rem', color: '#64748B' }}>
            Created by: <strong>{getCreatorNameForForm(editingSign)}</strong>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ flex: 1, padding: '0.8rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              {editingSign ? 'Update Sign' : 'Create Sign'}
            </button>
            <button type="button" onClick={resetForm} style={{ flex: 1, padding: '0.8rem', background: '#E2E8F0', color: '#0A2956', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem',
        background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '12px',
        padding: '0.6rem 1rem', maxWidth: '450px',
      }}>
        <span style={{ color: '#94A3B8', fontSize: '1.1rem' }}>🔍</span>
        <input
          type="text"
          placeholder="Search signs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', color: '#0A2956', background: 'transparent' }}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.1rem' }}>✕</button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#64748B' }}>Loading signs...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Creator</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Video</th>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSigns.map((s) => (
                <tr key={s.signId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={tdStyle}>{s.signId}</td>
                  <td style={tdStyle}>{getCreatorDisplay(s.createdBy)}</td>
                  <td style={tdStyle} title={s.signName}>{truncate(s.signName, 7)}</td>
                  <td style={tdStyle}>{s.description}</td>
                  <td style={tdStyle}>
                    {s.videoUrl ? (
                      <button
                        onClick={() => { setViewingSign(s); setViewingType('video'); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#135290',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '0.9rem',
                        }}
                      >
                        ▶ View
                      </button>
                    ) : '—'}
                  </td>
                  <td style={tdStyle}>
                    {s.imageUrl ? (
                      <button
                        onClick={() => { setViewingSign(s); setViewingType('image'); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#135290',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '0.9rem',
                        }}
                      >
                        🖼 View
                      </button>
                    ) : '—'}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button onClick={() => setSelectedSign(s)} style={iconButtonStyle} title="View details">👁️</button>
                      <button onClick={() => openEdit(s)} style={iconButtonStyle} title="Edit sign">✏️</button>
                      <button onClick={() => setDeleteTargetId(s.signId)} style={{ ...iconButtonStyle, color: '#EF4444' }} title="Delete sign">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSigns.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No signs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSign && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10, 41, 86, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setSelectedSign(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '550px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>{selectedSign.signName}</h3>
              <button onClick={() => setSelectedSign(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DetailRow label="Sign ID" value={selectedSign.signId} />
              <DetailRow label="Name" value={selectedSign.signName} />
              <DetailRow label="Description" value={selectedSign.description || '—'} />
              <DetailRow label="Video URL" value={selectedSign.videoUrl || '—'} mono />
              <DetailRow label="Image URL" value={selectedSign.imageUrl || '—'} mono />
              <DetailRow label="Created by" value={getCreatorDisplay(selectedSign.createdBy)} />
              <DetailRow label="Created at" value={new Date(selectedSign.createdAt).toLocaleString()} />
              <DetailRow label="Updated at" value={new Date(selectedSign.updatedAt).toLocaleString()} />
            </div>
            <button onClick={() => setSelectedSign(null)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.7rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Media Viewer Modal (video or image) */}
      {viewingSign && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
          }}
          onClick={() => setViewingSign(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '80%',
              width: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0A2956', margin: 0 }}>{viewingSign.signName}</h3>
              <button
                onClick={() => setViewingSign(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>
            {viewingType === 'video' && viewingSign.videoUrl && (
              <video
                controls
                autoPlay
                src={getMediaUrl(viewingSign.videoUrl)}
                style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh' }}
              />
            )}
            {viewingType === 'image' && viewingSign.imageUrl && (
              <img
                src={getMediaUrl(viewingSign.imageUrl)}
                alt={viewingSign.signName}
                style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh' }}
              />
            )}
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModalMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10, 41, 86, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setErrorModalMessage('')}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>{editingSign ? 'Update Failed' : 'Creation Failed'}</h3>
            </div>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', textAlign: 'center', marginBottom: '1.5rem' }}>{errorModalMessage}</p>
            <button onClick={() => setErrorModalMessage('')} style={{ width: '100%', padding: '0.7rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10, 41, 86, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setDeleteTargetId(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗑️</div>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>Delete Sign?</h3>
            </div>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', textAlign: 'center', marginBottom: '1.5rem' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setDeleteTargetId(null)} style={{ flex: 1, padding: '0.7rem', background: '#E2E8F0', color: '#0A2956', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '0.7rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'success' ? '#0A2956' : '#EF4444', color: 'white', padding: '0.85rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 3000, fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

// Helper for detail rows
function DetailRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
      <span style={{ color: '#64748B', fontWeight: 500, minWidth: '100px' }}>{label}</span>
      <span style={{ color: '#0A2956', fontWeight: 400, textAlign: 'right', wordBreak: 'break-all', fontFamily: mono ? 'monospace' : 'inherit' }}>{String(value)}</span>
    </div>
  );
}

// Styles
const inputStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1.5px solid #E2E8F0',
  outline: 'none',
  fontSize: '0.95rem',
  color: '#0A2956',
  background: '#F8FAFC',
  transition: 'border 0.2s',
};

const uploadButtonStyle = {
  padding: '0.5rem 1rem',
  background: '#0A2956',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '0.9rem',
};

const thStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: 600,
  color: '#0A2956',
  fontSize: '0.9rem',
};

const tdStyle = {
  padding: '0.75rem',
  color: '#334155',
  fontSize: '0.95rem',
};

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.1rem',
  padding: '0.2rem',
  color: '#135290',
  display: 'flex',
  alignItems: 'center',
};