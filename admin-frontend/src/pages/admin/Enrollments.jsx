import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'ADMIN';
  const endpoint = isAdmin ? '/enrollments/admin' : '/enrollments/teacher';

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const { data } = await api.get(endpoint);
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [endpoint]);

  return (
    <div>
      <h2 style={{ color: '#0A2956', fontWeight: 700, marginBottom: '1.5rem' }}>Student Enrollments</h2>

      {error && (
        <div style={{ background: '#FFF0F0', color: '#B00020', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748B' }}>Loading enrollments...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={thStyle}>Student</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Course</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Badge</th>
                <th style={thStyle}>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.enrollmentId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={tdStyle}>{e.studentName}</td>
                  <td style={tdStyle}>{e.studentEmail}</td>
                  <td style={tdStyle}>{e.courseTitle}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      background: e.status === 'ACTIVE' ? '#D2EFF9' : '#F1F5F9',
                      color: '#0A2956',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                    }}>
                      {e.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {e.badge ? (
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        background: '#E8F5E9',
                        color: '#2E7D32',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}>
                        {e.badge}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={tdStyle}>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#0A2956', fontSize: '0.9rem' };
const tdStyle = { padding: '0.75rem', color: '#334155', fontSize: '0.95rem' };