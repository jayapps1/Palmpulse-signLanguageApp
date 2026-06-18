import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';

const PAGE_SIZE = 10;

export default function AuditLogs() {
  const [allLogs, setAllLogs] = useState([]);   // full list from backend
  const [logs, setLogs] = useState([]);         // current page slice
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(allLogs.length / PAGE_SIZE);

  // Fetch only once
  const fetchedRef = useRef(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // This endpoint returns an array (not a page) – we handle pagination on the client
        const { data } = await api.get('/admin/audit-logs');
        setAllLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    if (!fetchedRef.current) {
      fetchLogs();
      fetchedRef.current = true;
    }
  }, []);

  // Slice whenever page changes
  useEffect(() => {
    const start = page * PAGE_SIZE;
    setLogs(allLogs.slice(start, start + PAGE_SIZE));
  }, [allLogs, page]);

  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];
    for (let i = Math.max(0, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#0A2956', fontWeight: 700 }}>Audit Logs</h2>
        <span style={{ color: '#64748B', fontSize: '0.9rem' }}>
          Total: {allLogs.length} logs
        </span>
      </div>

      {error && (
        <div style={{ background: '#FFF0F0', color: '#B00020', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid #FFCDD2' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748B' }}>Loading logs...</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Action</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.auditId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={tdStyle}>{log.auditId}</td>
                    <td style={tdStyle}>
                      {log.userFullName}{' '}
                      <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                        ({log.userEmail})
                      </span>
                    </td>
                    <td style={tdStyle}>{log.action}</td>
                    <td style={tdStyle}>{log.description}</td>
                    <td style={tdStyle}>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                      No logs on this page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem', gap: '0.5rem' }}>
              <button onClick={() => goToPage(0)} disabled={page === 0} style={paginationButtonStyle(page === 0)}>
                « First
              </button>
              <button onClick={() => goToPage(page - 1)} disabled={page === 0} style={paginationButtonStyle(page === 0)}>
                ‹ Prev
              </button>

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: p === page ? '2px solid #0A2956' : '1px solid #E2E8F0',
                    background: p === page ? '#0A2956' : '#FFFFFF',
                    color: p === page ? '#FFFFFF' : '#0A2956',
                    fontWeight: p === page ? 600 : 400,
                    cursor: 'pointer',
                    minWidth: '36px',
                  }}
                >
                  {p + 1}
                </button>
              ))}

              <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages - 1} style={paginationButtonStyle(page >= totalPages - 1)}>
                Next ›
              </button>
              <button onClick={() => goToPage(totalPages - 1)} disabled={page >= totalPages - 1} style={paginationButtonStyle(page >= totalPages - 1)}>
                Last »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const paginationButtonStyle = (disabled) => ({
  padding: '0.4rem 0.8rem',
  borderRadius: '6px',
  border: '1px solid #E2E8F0',
  background: disabled ? '#F8FAFC' : '#FFFFFF',
  color: disabled ? '#94A3B8' : '#0A2956',
  fontWeight: 500,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
});

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