import { useState, useEffect } from 'react';
import api from '../services/api';

const DEFAULT_QUESTION = { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' };

export default function QuizManager({ lessonId, userRole, onClose }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [isFinalQuiz, setIsFinalQuiz] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [questions, setQuestions] = useState([{ ...DEFAULT_QUESTION }]);

  const isAdmin = userRole === 'ADMIN';
  const baseEndpoint = isAdmin ? '/admin/quizzes' : '/teacher/quizzes';

  // Fetch existing quiz (if any)
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/lesson/${lessonId}`);
        setQuiz(data);
        setTitle(data.title);
        setIsFinalQuiz(data.isFinalQuiz);
        setNumberOfQuestions(data.numberOfQuestions ? String(data.numberOfQuestions) : '');
        setQuestions(data.questions.map(q => ({
          questionId: q.questionId,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
        })));
      } catch (err) {
        // No quiz yet – that's fine
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lessonId]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, { ...DEFAULT_QUESTION }]);
  const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      lessonId,
      title,
      isFinalQuiz,
      numberOfQuestions: numberOfQuestions ? parseInt(numberOfQuestions) : null,
      questions: questions.map(q => ({
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
      })),
    };

    setSaving(true);
    try {
      if (quiz) {
        await api.put(`/quizzes/${quiz.quizId}`, payload);
      } else {
        await api.post(baseEndpoint, payload);
      }
      onClose(true);   // signal success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!quiz) return;
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${quiz.quizId}`);
      onClose(true);
    } catch (err) {
      setError('Delete failed');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading quiz...</div>;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(10,41,86,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
    }} onClick={() => onClose(false)}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>
            {quiz ? 'Edit Quiz' : 'Create Quiz'}
          </h3>
          <button onClick={() => onClose(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
        </div>

        {error && (
          <div style={{ background: '#FFF0F0', color: '#B00020', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <input
              placeholder="Quiz Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={isFinalQuiz}
                onChange={e => setIsFinalQuiz(e.target.checked)}
              />
              <label style={{ color: '#0A2956', fontWeight: 500 }}>Final Quiz</label>
            </div>
            <input
              type="number"
              placeholder="Number of questions (leave blank for all)"
              value={numberOfQuestions}
              onChange={e => setNumberOfQuestions(e.target.value)}
              min="1"
              style={inputStyle}
            />
          </div>

          <h4 style={{ color: '#0A2956', marginBottom: '1rem' }}>Questions</h4>
          {questions.map((q, idx) => (
            <div key={idx} style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#0A2956' }}>Question {idx + 1}</span>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Remove
                  </button>
                )}
              </div>
              <input
                placeholder="Question text"
                value={q.questionText}
                onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                required
                style={{ ...inputStyle, marginBottom: '0.5rem' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input placeholder="Option A" value={q.optionA} onChange={e => handleQuestionChange(idx, 'optionA', e.target.value)} required style={inputStyle} />
                <input placeholder="Option B" value={q.optionB} onChange={e => handleQuestionChange(idx, 'optionB', e.target.value)} required style={inputStyle} />
                <input placeholder="Option C" value={q.optionC} onChange={e => handleQuestionChange(idx, 'optionC', e.target.value)} required style={inputStyle} />
                <input placeholder="Option D" value={q.optionD} onChange={e => handleQuestionChange(idx, 'optionD', e.target.value)} required style={inputStyle} />
              </div>
              <select
                value={q.correctAnswer}
                onChange={e => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                style={inputStyle}
              >
                <option value="A">Correct Answer: A</option>
                <option value="B">Correct Answer: B</option>
                <option value="C">Correct Answer: C</option>
                <option value="D">Correct Answer: D</option>
              </select>
            </div>
          ))}

          <button type="button" onClick={addQuestion} style={{ padding: '0.5rem 1rem', background: '#F1F5F9', color: '#0A2956', border: '1px dashed #A8D8F5', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 500 }}>
            + Add Question
          </button>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.8rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save Quiz'}
            </button>
            {quiz && (
              <button type="button" onClick={handleDelete} style={{ padding: '0.8rem 1.5rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1.5px solid #E2E8F0',
  outline: 'none',
  fontSize: '0.95rem',
  color: '#0A2956',
  background: '#FFFFFF',
  width: '100%',
  transition: 'border 0.2s',
};