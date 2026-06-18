import { useEffect, useState } from 'react';
import api from '../../services/api';
import QuizManager from '../../components/QuizManager';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [lessonMap, setLessonMap] = useState({});   // lessonId → lesson object

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'ADMIN';
  const baseEndpoint = isAdmin ? '/admin/quizzes' : '/teacher/quizzes';
  const lessonEndpoint = isAdmin ? '/admin/lessons' : '/teacher/lessons';

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      // Fetch quizzes and lessons in parallel
      const [quizRes, lessonRes] = await Promise.all([
        api.get(baseEndpoint),
        api.get(lessonEndpoint),
      ]);

      const quizData = Array.isArray(quizRes.data) ? quizRes.data : [];
      const lessonData = Array.isArray(lessonRes.data) ? lessonRes.data : [];

      // Build a map: lessonId → lesson object
      const map = {};
      lessonData.forEach(l => { map[l.lessonId] = l; });
      setLessonMap(map);

      setQuizzes(quizData);
    } catch (err) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleCloseModal = (refresh) => {
    setEditingQuiz(null);
    setCreatingQuiz(false);
    if (refresh) fetchQuizzes();
  };

  // Truncate helper
  const truncate = (text, maxLen = 15) => {
    if (!text || typeof text !== 'string') return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '…' : text;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#0A2956', fontWeight: 700 }}>Quizzes</h2>
        <button
          onClick={() => setCreatingQuiz(true)}
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
          + Create Quiz
        </button>
      </div>

      {error && (
        <div style={{ background: '#FFF0F0', color: '#B00020', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748B' }}>Loading quizzes...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={thStyle}>Quiz ID</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Lesson</th>
                <th style={thStyle}>Questions</th>
                <th style={thStyle}>Final Quiz</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(q => {
                const lesson = lessonMap[q.lessonId];
                return (
                  <tr key={q.quizId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={tdStyle}>{q.quizId}</td>
                    <td style={tdStyle} title={q.title}>
                      {truncate(q.title, 15)}
                    </td>
                    <td style={tdStyle} title={lesson?.title || ''}>
                      {truncate(lesson?.title || `Lesson #${q.lessonId}`, 15)}
                    </td>
                    <td style={tdStyle}>{q.numberOfQuestions || q.questions?.length || '—'}</td>
                    <td style={tdStyle}>{q.isFinalQuiz ? '✅' : '—'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setEditingQuiz(q)}
                          style={{ background: 'none', border: 'none', color: '#135290', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete this quiz?')) {
                              await api.delete(`/quizzes/${q.quizId}`);
                              fetchQuizzes();
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No quizzes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingQuiz && (
        <QuizManager
          lessonId={editingQuiz.lessonId}
          userRole={currentUser.role}
          onClose={handleCloseModal}
        />
      )}

      {creatingQuiz && (
        <CreateQuizModal userRole={currentUser.role} onClose={handleCloseModal} />
      )}
    </div>
  );
}

// Helper component to select a lesson before creating a quiz
function CreateQuizModal({ userRole, onClose }) {
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole === 'ADMIN';
  const endpoint = isAdmin ? '/admin/lessons' : '/teacher/lessons';

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data } = await api.get(endpoint);
        setLessons(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [endpoint]);

  if (selectedLessonId) {
    return (
      <QuizManager
        lessonId={selectedLessonId}
        userRole={userRole}
        onClose={onClose}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(10,41,86,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 2000, padding: '1rem',
    }} onClick={() => onClose(false)}>
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', maxWidth: '500px', width: '100%',
        padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#0A2956', marginBottom: '1.5rem' }}>Select a Lesson</h3>
        {loading ? (
          <p style={{ color: '#64748B' }}>Loading lessons...</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {lessons.map(l => (
              <div
                key={l.lessonId}
                onClick={() => setSelectedLessonId(l.lessonId)}
                style={{
                  padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                  marginBottom: '0.5rem', border: '1px solid #E2E8F0',
                  background: '#F8FAFC', color: '#0A2956', fontWeight: 500,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
              >
                {l.title}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => onClose(false)}
          style={{
            marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#E2E8F0',
            color: '#0A2956', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const thStyle = { padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#0A2956', fontSize: '0.9rem' };
const tdStyle = { padding: '0.75rem', color: '#334155', fontSize: '0.95rem' };