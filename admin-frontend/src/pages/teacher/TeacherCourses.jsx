import { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';

const DIFFICULTY_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const DEFAULT_FORM = {
  title: '',
  description: '',
  difficultyLevel: 'BEGINNER',
  status: 'DRAFT',
};

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

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
      const { data } = await api.get('/teacher/courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const term = searchTerm.toLowerCase();
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.difficultyLevel?.toLowerCase().includes(term) ||
        c.status?.toLowerCase().includes(term)
    );
  }, [courses, searchTerm]);

  const handleDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await api.delete(`/teacher/courses/${deleteTargetId}`);
      setCourses(prev => prev.filter(c => c.id !== deleteTargetId));
      setToast({ message: 'Course deleted!', type: 'success' });
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      difficultyLevel: form.difficultyLevel,
      status: form.status,
    };

    try {
      if (editingCourse) {
        await api.put(`/teacher/courses/${editingCourse.id}`, payload);
        setToast({ message: 'Course updated!', type: 'success' });
      } else {
        await api.post('/teacher/courses', payload);
        setToast({ message: 'Course created!', type: 'success' });
      }
      setShowForm(false);
      setEditingCourse(null);
      setForm(DEFAULT_FORM);
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
    setEditingCourse(null);
    setShowForm(false);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title || '',
      description: course.description || '',
      difficultyLevel: course.difficultyLevel || 'BEGINNER',
      status: course.status || 'DRAFT',
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingCourse(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: '#0A2956', fontWeight: 700 }}>My Courses</h2>
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
          {showForm ? 'Close Form' : '+ Add Course'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#FFF0F0', color: '#B00020', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid #FFCDD2' }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit}
          style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px',
            padding: '1.5rem', marginBottom: '2rem', display: 'grid',
            gridTemplateColumns: '1fr 1fr', gap: '1rem',
          }}
        >
          <input name="title" value={form.title} onChange={handleChange} placeholder="Course title" required style={inputStyle} />
          <select name="difficultyLevel" value={form.difficultyLevel} onChange={handleChange} style={inputStyle}>
            {DIFFICULTY_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
          <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Course description"
            rows={3}
            required
            style={{ ...inputStyle, gridColumn: 'span 2', resize: 'vertical' }}
          />
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ flex: 1, padding: '0.8rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              {editingCourse ? 'Update Course' : 'Create Course'}
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
          placeholder="Search courses..."
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
        <p style={{ color: '#64748B' }}>Loading courses...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Difficulty</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={tdStyle}>{c.id}</td>
                  <td style={tdStyle}>{c.title}</td>
                  <td style={tdStyle}>{c.difficultyLevel}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '12px',
                      background: c.status === 'PUBLISHED' ? '#D2EFF9' : c.status === 'DRAFT' ? '#F1F5F9' : '#FEE2E2',
                      color: '#0A2956', fontWeight: 500, fontSize: '0.85rem',
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button onClick={() => setSelectedCourse(c)} style={iconButtonStyle} title="View details">👁️</button>
                      <button onClick={() => openEdit(c)} style={iconButtonStyle} title="Edit course">✏️</button>
                      <button onClick={() => setDeleteTargetId(c.id)} style={{ ...iconButtonStyle, color: '#EF4444' }} title="Delete course">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCourse && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10, 41, 86, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setSelectedCourse(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>{selectedCourse.title}</h3>
              <button onClick={() => setSelectedCourse(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DetailRow label="Course ID" value={selectedCourse.id} />
              <DetailRow label="Title" value={selectedCourse.title} />
              <DetailRow label="Description" value={selectedCourse.description || '—'} />
              <DetailRow label="Difficulty" value={selectedCourse.difficultyLevel} />
              <DetailRow label="Status" value={selectedCourse.status} />
              <DetailRow label="Created by" value={selectedCourse.createdBy || 'Unknown'} />
              <DetailRow label="Created at" value={new Date(selectedCourse.createdAt).toLocaleString()} />
              <DetailRow label="Updated at" value={new Date(selectedCourse.updatedAt).toLocaleString()} />
            </div>
            <button onClick={() => setSelectedCourse(null)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.7rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModalMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10, 41, 86, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setErrorModalMessage('')}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>{editingCourse ? 'Update Failed' : 'Creation Failed'}</h3>
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
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>Delete Course?</h3>
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

function DetailRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
      <span style={{ color: '#64748B', fontWeight: 500, minWidth: '100px' }}>{label}</span>
      <span style={{ color: '#0A2956', fontWeight: 400, textAlign: 'right', wordBreak: 'break-all', fontFamily: mono ? 'monospace' : 'inherit' }}>{String(value)}</span>
    </div>
  );
}

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