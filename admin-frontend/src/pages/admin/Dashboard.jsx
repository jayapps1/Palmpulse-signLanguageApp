import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    lessons: 0,
    signs: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Additional breakdown data
  const [usersByRole, setUsersByRole] = useState({ ADMIN: 0, TEACHER: 0, STUDENT: 0 });
  const [coursesByStatus, setCoursesByStatus] = useState({ PUBLISHED: 0, DRAFT: 0, ARCHIVED: 0 });
  const [newestUsers, setNewestUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, coursesRes, lessonsRes, signsRes, logsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/courses'),
          api.get('/admin/lessons'),
          api.get('/admin/signs'),
          api.get('/admin/audit-logs'),
        ]);

        // Basic counts
        setStats({
          users: usersRes.data.length,
          courses: coursesRes.data.length,
          lessons: lessonsRes.data.length,
          signs: signsRes.data.length,
        });

        // Users by role
        const roleCounts = { ADMIN: 0, TEACHER: 0, STUDENT: 0 };
        usersRes.data.forEach((u) => {
          if (u.role in roleCounts) roleCounts[u.role]++;
        });
        setUsersByRole(roleCounts);

        // Courses by status
        const statusCounts = { PUBLISHED: 0, DRAFT: 0, ARCHIVED: 0 };
        coursesRes.data.forEach((c) => {
          if (c.status in statusCounts) statusCounts[c.status]++;
        });
        setCoursesByStatus(statusCounts);

        // 5 newest users (assuming they have createdAt)
        const sortedUsers = [...usersRes.data]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5);
        setNewestUsers(sortedUsers);

        // Recent audit logs (last 5)
        const sortedLogs = (logsRes.data || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentLogs(sortedLogs);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stat cards config
  const statCards = [
    { label: 'Total Users', value: stats.users, icon: '👥', link: '/admin/users', color: '#D2EFF9' },
    { label: 'Courses', value: stats.courses, icon: '📚', link: '/admin/courses', color: '#A8D8F5' },
    { label: 'Lessons', value: stats.lessons, icon: '📖', link: '/admin/lessons', color: '#6EB7EA' },
    { label: 'Signs', value: stats.signs, icon: '🤟', link: '/admin/signs', color: '#135290' },
  ];

  const quickActions = [
    { label: 'Add Teacher / Admin', link: '/admin/users', icon: '➕' },
    { label: 'Create Course', link: '/admin/courses', icon: '📚' },
    { label: 'Add Lesson', link: '/admin/lessons', icon: '📖' },
    { label: 'Add Sign', link: '/admin/signs', icon: '🤟' },
  ];

  // Helper to render a simple horizontal bar
  const Bar = ({ label, value, total, color }) => {
    const pct = total > 0 ? (value / total) * 100 : 0;
    return (
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>{label}</span>
          <span style={{ color: '#0A2956', fontWeight: 600, fontSize: '0.85rem' }}>{value}</span>
        </div>
        <div style={{ background: '#F1F5F9', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '6px', transition: 'width 0.3s' }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return <p style={{ color: '#64748B' }}>Loading statistics...</p>;
  }

  return (
    <div>
      <h2 style={{ color: '#0A2956', fontWeight: 700, marginBottom: '1.5rem' }}>
        Dashboard Overview
      </h2>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              border: '1px solid #E2E8F0',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(10,41,86,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
            }}>
              {card.icon}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0A2956' }}>
              {card.value}
            </div>
            <div style={{ color: '#64748B', fontWeight: 500, marginTop: '0.25rem' }}>
              {card.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column section: breakdowns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        {/* Users by Role */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}>
          <h3 style={{ color: '#0A2956', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Users by Role
          </h3>
          <Bar label="Admin" value={usersByRole.ADMIN} total={stats.users} color="#0A2956" />
          <Bar label="Teacher" value={usersByRole.TEACHER} total={stats.users} color="#135290" />
          <Bar label="Student" value={usersByRole.STUDENT} total={stats.users} color="#6EB7EA" />
        </div>

        {/* Courses by Status */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}>
          <h3 style={{ color: '#0A2956', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Courses by Status
          </h3>
          <Bar label="Published" value={coursesByStatus.PUBLISHED} total={stats.courses} color="#6EB7EA" />
          <Bar label="Draft" value={coursesByStatus.DRAFT} total={stats.courses} color="#A8D8F5" />
          <Bar label="Archived" value={coursesByStatus.ARCHIVED} total={stats.courses} color="#D2EFF9" />
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#0A2956', fontWeight: 600, marginBottom: '1rem' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.link}
              style={{
                padding: '0.6rem 1.2rem',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                textDecoration: 'none',
                color: '#0A2956',
                fontWeight: 500,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
            >
              <span>{action.icon}</span> {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Newest Users + Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        {/* 5 Newest Users */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}>
          <h3 style={{ color: '#0A2956', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Newest Users
          </h3>
          {newestUsers.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {newestUsers.map((u) => (
                <li key={u.userId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #F1F5F9',
                  fontSize: '0.9rem',
                }}>
                  <div>
                    <span style={{ fontWeight: 500, color: '#0A2956' }}>{u.fullName}</span>
                    <span style={{ color: '#94A3B8', marginLeft: '0.5rem' }}>({u.role})</span>
                  </div>
                  <span style={{ color: '#64748B' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No users found.</p>
          )}
        </div>

        {/* Recent Audit Logs */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}>
          <h3 style={{ color: '#0A2956', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Recent Activity
          </h3>
          {recentLogs.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Action</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.auditId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={tdStyle}>{log.userFullName}</td>
                      <td style={tdStyle}>{log.action}</td>
                      <td style={tdStyle}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No recent activity.</p>
          )}
          <Link
            to="/admin/audit-logs"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              color: '#135290',
              fontWeight: 500,
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            View all logs →
          </Link>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '0.5rem',
  textAlign: 'left',
  fontWeight: 600,
  color: '#0A2956',
  fontSize: '0.85rem',
};

const tdStyle = {
  padding: '0.5rem',
  color: '#334155',
  fontSize: '0.85rem',
};