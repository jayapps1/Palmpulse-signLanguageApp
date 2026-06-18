import { useEffect, useState } from 'react';
import axios from 'axios';

// Dedicated instance – no global 401 redirect
const notifyApi = axios.create({ baseURL: '/api' });
notifyApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  // Auto‑dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await notifyApi.get('/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load notifications. Ensure you have the necessary permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select / deselect all
  const toggleAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.notificationId));
    }
  };

  // Mark selected as read
  const markSelectedAsRead = async () => {
    try {
      await Promise.all(selectedIds.map((id) => notifyApi.put(`/notifications/${id}/read`)));
      setNotifications((prev) =>
        prev.map((n) => (selectedIds.includes(n.notificationId) ? { ...n, read: true } : n))
      );
      setSelectedIds([]);
      setToast({ message: 'Marked as read!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed', type: 'error' });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notifyApi.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setToast({ message: 'All marked as read!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed', type: 'error' });
    }
  };

  // Bulk delete
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} notification(s)?`)) return;
    try {
      await notifyApi.delete('/notifications', { data: selectedIds });
      setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.notificationId)));
      setSelectedIds([]);
      setToast({ message: 'Deleted!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  // Delete single
  const deleteSingle = async (id) => {
    try {
      await notifyApi.delete('/notifications', { data: [id] });
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
      setToast({ message: 'Deleted!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  return (
    <div>
      <h2 style={{ color: '#0A2956', fontWeight: 700, marginBottom: '1.5rem' }}>
        Notifications
      </h2>

      {/* Bulk actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={selectedIds.length === notifications.length && notifications.length > 0}
            onChange={toggleAll}
          />
          Select All
        </label>
        {selectedIds.length > 0 && (
          <>
            <button onClick={markSelectedAsRead} style={actionButtonStyle}>
              Mark Read
            </button>
            <button onClick={deleteSelected} style={{ ...actionButtonStyle, background: '#EF4444' }}>
              Delete Selected
            </button>
          </>
        )}
        <button onClick={markAllAsRead} style={actionButtonStyle}>
          Mark All Read
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ color: '#64748B', fontSize: '0.9rem' }}>
          {notifications.length} notification(s)
        </span>
      </div>

      {/* Error message */}
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

      {/* Table */}
      {loading ? (
        <p style={{ color: '#64748B' }}>Loading...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={thStyle}></th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr
                  key={n.notificationId}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    background: n.read ? 'transparent' : '#F0F9FF',
                  }}
                >
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(n.notificationId)}
                      onChange={() => toggleSelect(n.notificationId)}
                    />
                  </td>
                  <td style={tdStyle}>{n.title}</td>
                  <td style={tdStyle}>{n.message}</td>
                  <td style={tdStyle}>{new Date(n.createdAt).toLocaleString()}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        background: n.read ? '#F1F5F9' : '#D2EFF9',
                        color: '#0A2956',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                      }}
                    >
                      {n.read ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!n.read && (
                        <button
                          onClick={() => {
                            notifyApi.put(`/notifications/${n.notificationId}/read`);
                            setNotifications((prev) =>
                              prev.map((x) =>
                                x.notificationId === n.notificationId ? { ...x, read: true } : x
                              )
                            );
                          }}
                          style={smallIconButton}
                        >
                          ✅
                        </button>
                      )}
                      <button onClick={() => deleteSingle(n.notificationId)} style={smallIconButton}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && !error && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                    No notifications.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
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

const actionButtonStyle = {
  padding: '0.5rem 1rem',
  background: '#0A2956',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '0.85rem',
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

const smallIconButton = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  padding: '0.2rem',
};