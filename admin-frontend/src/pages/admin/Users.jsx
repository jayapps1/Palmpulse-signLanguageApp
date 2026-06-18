import { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';

const DEFAULT_PASSWORD = 'PalmPulse123';   // default for new accounts

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: DEFAULT_PASSWORD,
    phoneNumber: '',
    role: '3',
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);   // { message, type: 'success'|'error' }

  // Auto‑dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Filter users based on search term ──
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // ── Delete user ──
  const handleDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await api.delete(`/admin/users/${deleteTargetId}`);
      setUsers(users.filter((u) => u.userId !== deleteTargetId));
      setToast({ message: 'User deleted successfully!', type: 'success' });
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteTargetId(null);
    }
  };

  // ── Create user ──
  const handleCreate = async (e) => {
    e.preventDefault();
    const endpoint = form.role === '1' ? '/admin/users/admin' : '/admin/users/teacher';

    try {
      await api.post(endpoint, {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
      });
      setShowForm(false);
      setForm({
        fullName: '',
        email: '',
        password: DEFAULT_PASSWORD,
        phoneNumber: '',
        role: '3',
      });
      fetchUsers();
      setToast({ message: 'User created successfully!', type: 'success' });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        err.message ||
        'An unknown error occurred';
      setErrorModalMessage(message);
    }
  };

  // ── Reset form to defaults ──
  const resetForm = () => {
    setForm({
      fullName: '',
      email: '',
      password: DEFAULT_PASSWORD,
      phoneNumber: '',
      role: '3',
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Avatar helper ──
  const getUserAvatar = (user) => {
    const picUrl = user.profilePictureUrl
      ? (user.profilePictureUrl.startsWith('http')
          ? user.profilePictureUrl
          : `http://localhost:8085${user.profilePictureUrl}`)
      : null;

    if (picUrl) {
      return (
        <img
          src={picUrl}
          alt=""
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid #D2EFF9',
          }}
        />
      );
    }
    return (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#D2EFF9',
          color: '#0A2956',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.8rem',
        }}
      >
        {user.fullName?.charAt(0).toUpperCase() || '?'}
      </div>
    );
  };

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h2 style={{ color: '#0A2956', fontWeight: 700 }}>Users</h2>
        <button
          onClick={() => setShowForm(!showForm)}
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
          {showForm ? 'Close Form' : '+ Add Teacher / Admin'}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: '#FFF0F0',
            color: '#B00020',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            marginBottom: '1rem',
            border: '1px solid #FFCDD2',
          }}
        >
          {error}
        </div>
      )}

      {/* Creation form (toggle) */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}
        >
          <select name="role" value={form.role} onChange={handleChange} style={inputStyle}>
            <option value="3">Teacher</option>
            <option value="1">Admin</option>
          </select>
          <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. John Doe" required style={inputStyle} />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="e.g. teacher@school.edu" required style={inputStyle} />
          <input
            name="password"
            type="text"
            value={form.password}
            onChange={handleChange}
            placeholder="Default password"
            required
            style={inputStyle}
            title="Default password is 'PalmPulse123' – you can change it here"
          />
          <input
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="e.g. +233542011738"
            required
            style={inputStyle}
            title="Please enter a valid international number with country code (e.g., +233542011738)"
          />
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.8rem',
                background: '#0A2956',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Create User
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                flex: 1,
                padding: '0.8rem',
                background: '#E2E8F0',
                color: '#0A2956',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Reset Form
            </button>
          </div>
          <p style={{ gridColumn: 'span 2', fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
            Default password: <strong>{DEFAULT_PASSWORD}</strong>. You can change it above.
          </p>
        </form>
      )}

      {/* Search bar */}
            {/* Search bar – styled */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
              maxWidth: '450px',
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = '#6EB7EA';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110, 183, 234, 0.2)';
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Search icon */}
              <span style={{ color: '#94A3B8', fontSize: '1.1rem' }}>🔍</span>

              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#0A2956',
                  background: 'transparent',
                  fontFamily: 'inherit',
                }}
              />

              {/* Clear button (appears only when text is present) */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    fontSize: '1.1rem',
                    padding: '0.2rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

      {/* Users table */}
      {loading ? (
        <p style={{ color: '#64748B' }}>Loading users...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.userId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={tdStyle}>{u.userId}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getUserAvatar(u)}
                      <span>{u.fullName}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        background: u.role === 'ADMIN' ? '#D2EFF9' : '#F1F5F9',
                        color: '#0A2956',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setSelectedUser(u)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#135290',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          textDecoration: 'underline',
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(u.userId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '0.9rem',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail Modal (unchanged) ── */}
      {selectedUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(10, 41, 86, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '450px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#94A3B8',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              {getUserAvatar(selectedUser)}
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#0A2956' }}>
                  {selectedUser.fullName}
                </div>
                <div style={{ color: '#64748B', fontSize: '0.9rem' }}>{selectedUser.role}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DetailRow label="User ID" value={selectedUser.userId} />
              <DetailRow label="Full Name" value={selectedUser.fullName} />
              <DetailRow label="Email" value={selectedUser.email} />
              <DetailRow label="Phone" value={selectedUser.phoneNumber || '—'} />
              <DetailRow label="Role" value={selectedUser.role} />
              <DetailRow
                label="Profile Picture"
                value={
                  selectedUser.profilePictureUrl
                    ? (selectedUser.profilePictureUrl.startsWith('http')
                        ? selectedUser.profilePictureUrl
                        : `http://localhost:8085${selectedUser.profilePictureUrl}`)
                    : 'None'
                }
                mono
              />
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.7rem',
                background: '#0A2956',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Error Modal (unchanged) ── */}
      {errorModalMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(10, 41, 86, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={() => setErrorModalMessage('')}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>Creation Failed</h3>
            </div>
            <p
              style={{
                color: '#475569',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                textAlign: 'center',
                marginBottom: errorModalMessage.toLowerCase().includes('phone') ? '1rem' : '1.5rem',
              }}
            >
              {errorModalMessage}
            </p>
            {errorModalMessage.toLowerCase().includes('phone') && (
              <p
                style={{
                  color: '#0A2956',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  background: '#F1F5F9',
                  padding: '0.5rem',
                  borderRadius: '8px',
                }}
              >
                📱 Please enter a valid international number with country code (e.g. +233501234567).
              </p>
            )}
            <button
              onClick={() => setErrorModalMessage('')}
              style={{
                width: '100%',
                padding: '0.7rem',
                background: '#0A2956',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal (unchanged) ── */}
      {deleteTargetId !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(10, 41, 86, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={() => setDeleteTargetId(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗑️</div>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>Confirm Delete</h3>
            </div>
            <p
              style={{
                color: '#475569',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setDeleteTargetId(null)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  background: '#E2E8F0',
                  color: '#0A2956',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: toast.type === 'success' ? '#0A2956' : '#EF4444',
            color: 'white',
            padding: '0.85rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 3000,
            fontWeight: 500,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
      <span style={{ color: '#64748B', fontWeight: 500, minWidth: '100px' }}>{label}</span>
      <span
        style={{
          color: '#0A2956',
          fontWeight: 400,
          textAlign: 'right',
          wordBreak: 'break-all',
          fontFamily: mono ? 'monospace' : 'inherit',
        }}
      >
        {value}
      </span>
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