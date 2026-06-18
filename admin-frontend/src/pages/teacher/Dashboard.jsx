import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ courses: 0, lessons: 0, signs: 0, quizzes: 0 });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coursesRes, lessonsRes, signsRes, quizzesRes, notifRes] = await Promise.all([
          api.get('/teacher/courses'),
          api.get('/teacher/lessons'),
          api.get('/teacher/signs'),
          api.get('/teacher/quizzes'),          // ✅ added quizzes
          api.get('/notifications'),
        ]);

        setStats({
          courses: coursesRes.data.length,
          lessons: lessonsRes.data.length,
          signs: signsRes.data.length,
          quizzes: quizzesRes.data.length,       // ✅ store quiz count
        });

        // Show the last 4 notifications
        const notifs = Array.isArray(notifRes.data) ? notifRes.data : [];
        setRecentNotifications(notifs.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'My Courses', value: stats.courses, icon: '📚', link: '/teacher/courses', color: '#D2EFF9' },
    { label: 'My Lessons', value: stats.lessons, icon: '📖', link: '/teacher/lessons', color: '#A8D8F5' },
    { label: 'My Signs',   value: stats.signs,   icon: '🤟', link: '/teacher/signs',   color: '#6EB7EA' },
    { label: 'Quizzes',    value: stats.quizzes,  icon: '📝', link: '/teacher/quizzes', color: '#D2EFF9' },   // ✅ new
  ];

  const quickActions = [
    { label: 'Create Course', link: '/teacher/courses', icon: '📚' },
    { label: 'Add Lesson',    link: '/teacher/lessons', icon: '📖' },
    { label: 'Add Sign',      link: '/teacher/signs',   icon: '🤟' },
    { label: 'Create Quiz',   link: '/teacher/quizzes', icon: '📝' },   // ✅ new
  ];

  if (loading) return <p style={{ color: '#64748B' }}>Loading dashboard...</p>;

  return (
    <div>
      <h2 style={{ color: '#0A2956', fontWeight: 700, marginBottom: '1.5rem' }}>
        Teacher Dashboard
      </h2>

      {/* Stat Cards */}
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

      {/* Quick Actions */}
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

      {/* Recent Notifications */}
      <div>
        <h3 style={{ color: '#0A2956', fontWeight: 600, marginBottom: '1rem' }}>
          Recent Notifications
        </h3>
        {recentNotifications.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentNotifications.map((n) => (
              <li key={n.notificationId} style={{
                background: '#FFFFFF',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                border: '1px solid #E2E8F0',
                fontSize: '0.9rem',
                color: '#334155',
              }}>
                <strong>{n.title}</strong> – {n.message}
                <span style={{ display: 'block', color: '#94A3B8', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#64748B' }}>No new notifications.</p>
        )}
      </div>
    </div>
  );
}