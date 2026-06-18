import { useEffect, useState, useMemo, useRef } from 'react';
import api from '../../services/api';

const DIFFICULTY_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const STATUSES = ['DRAFT', 'PUBLISHED'];

const DEFAULT_QUESTION = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
};

const DEFAULT_FORM = {
  title: '',
  description: '',
  content: '',
  difficultyLevel: 'BEGINNER',
  status: 'DRAFT',
  courseId: '',
};

export default function TeacherLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [courses, setCourses] = useState([]);

  // ── Manage Signs state ──
  const [managingSignsFor, setManagingSignsFor] = useState(null);
  const [lessonSigns, setLessonSigns] = useState([]);
  const [allSigns, setAllSigns] = useState([]);

  // ── Video / image upload for lesson form ──
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const videoPreviewRef = useRef(null);
  const [formVideoFile, setFormVideoFile] = useState(null);
  const [formImageFile, setFormImageFile] = useState(null);

  // ── Media viewer for signs ──
  const [viewingSign, setViewingSign] = useState(null);
  const [viewingType, setViewingType] = useState('video');

  // ── Quiz state embedded in the form ──
  const [quizTitle, setQuizTitle] = useState('');
  const [isFinalQuiz, setIsFinalQuiz] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [questions, setQuestions] = useState([{ ...DEFAULT_QUESTION }]);
  const [existingQuiz, setExistingQuiz] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.userId;
  const currentUserFullName = currentUser.fullName || 'You';

  // Toast auto‑dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch only teacher endpoints – no admin calls
  const fetchData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, coursesRes] = await Promise.all([
        api.get('/teacher/lessons'),
        api.get('/teacher/courses'),
      ]);
      setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : []);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Sign helpers ──
  const fetchAllSigns = async () => {
    if (allSigns.length > 0) return;
    try {
      const { data } = await api.get('/teacher/signs');
      setAllSigns(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to fetch signs:', err); }
  };

  const fetchLessonSigns = async (lessonId) => {
    try {
      const { data } = await api.get(`/lessons/${lessonId}/signs`);
      setLessonSigns(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to fetch lesson signs:', err); }
  };

  const openManageSigns = (lesson) => {
    setManagingSignsFor(lesson);
    fetchAllSigns();
    fetchLessonSigns(lesson.lessonId);
  };

  const handleAddSign = async (signId) => {
    try {
      await api.post(`/lessons/${managingSignsFor.lessonId}/signs/${signId}`);
      setToast({ message: 'Sign added!', type: 'success' });
      fetchLessonSigns(managingSignsFor.lessonId);
    } catch (err) { setToast({ message: 'Failed to add sign', type: 'error' }); }
  };

  const handleRemoveSign = async (signId) => {
    try {
      await api.delete(`/lessons/${managingSignsFor.lessonId}/signs/${signId}`);
      setToast({ message: 'Sign removed!', type: 'success' });
      fetchLessonSigns(managingSignsFor.lessonId);
    } catch (err) { setToast({ message: 'Failed to remove sign', type: 'error' }); }
  };

  const filteredLessons = useMemo(() => {
    if (!searchTerm.trim()) return lessons;
    const term = searchTerm.toLowerCase();
    return lessons.filter(
      l =>
        l.title?.toLowerCase().includes(term) ||
        l.description?.toLowerCase().includes(term) ||
        l.difficultyLevel?.toLowerCase().includes(term) ||
        l.status?.toLowerCase().includes(term)
    );
  }, [lessons, searchTerm]);

  const handleDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await api.delete(`/lessons/${deleteTargetId}`);
      setLessons(prev => prev.filter(l => l.lessonId !== deleteTargetId));
      setToast({ message: 'Lesson deleted!', type: 'success' });
    } catch (err) { alert('Delete failed'); } finally { setDeleteTargetId(null); }
  };

  // ── Media helpers ──
  const getMediaUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://localhost:8085${path}`;
  };

  const handleVideoFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setFormVideoFile(file);
  };

  const captureThumbnail = () => {
    const video = videoPreviewRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) return;
      setFormImageFile(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
      setToast({ message: 'Thumbnail captured!', type: 'success' });
    }, 'image/jpeg', 0.9);
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormImageFile(file);
  };

  // Quiz helpers
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, { ...DEFAULT_QUESTION }]);
  const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));

  // ── Create or Update with auto sign creation + quiz creation ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      content: form.content,
      difficultyLevel: form.difficultyLevel,
      status: form.status,
      courseId: form.courseId ? Number(form.courseId) : null,
    };

    let lessonId = editingLesson ? editingLesson.lessonId : null;

    try {
      if (editingLesson) {
        await api.put(`/lessons/${lessonId}`, payload);
        setToast({ message: 'Lesson updated!', type: 'success' });
      } else {
        const { data } = await api.post('/teacher/lessons', payload);
        lessonId = data.lessonId;
        setToast({ message: 'Lesson created!', type: 'success' });
      }

      // Video / sign creation (unchanged)
      if (formVideoFile || formImageFile) {
        let videoUrl = null, imageUrl = null;

        if (formVideoFile) {
          setUploadingVideo(true);
          try {
            const vForm = new FormData();
            vForm.append('file', formVideoFile);
            vForm.append('type', 'video');
            const vRes = await api.post('/signs/upload', vForm, { headers: { 'Content-Type': 'multipart/form-data' } });
            videoUrl = vRes.data.url;
          } catch (err) { setToast({ message: 'Video upload failed, but lesson saved', type: 'error' }); }
          finally { setUploadingVideo(false); }
        }

        if (formImageFile) {
          setUploadingImage(true);
          try {
            const iForm = new FormData();
            iForm.append('file', formImageFile);
            iForm.append('type', 'image');
            const iRes = await api.post('/signs/upload', iForm, { headers: { 'Content-Type': 'multipart/form-data' } });
            imageUrl = iRes.data.url;
          } catch (err) { setToast({ message: 'Image upload failed, but lesson saved', type: 'error' }); }
          finally { setUploadingImage(false); }
        }

        if (videoUrl || imageUrl) {
          const signPayload = {
            signName: form.title || 'Untitled Sign',
            description: `Sign for lesson: ${form.title}`,
            videoUrl: videoUrl || '',
            imageUrl: imageUrl || '',
          };
          try {
            const signRes = await api.post('/teacher/signs', signPayload);
            await api.post(`/lessons/${lessonId}/signs/${signRes.data.signId}`);
            setToast({ message: 'Sign created and linked!', type: 'success' });
          } catch (err) { setToast({ message: 'Sign creation failed, but lesson saved', type: 'error' }); }
        }
      }

      // Quiz creation / update
      if (quizTitle || questions.some(q => q.questionText.trim())) {
        const quizPayload = {
          lessonId,
          title: quizTitle || `${form.title} Quiz`,
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

        if (existingQuiz) {
          await api.put(`/quizzes/${existingQuiz.quizId}`, quizPayload);
        } else {
          await api.post('/teacher/quizzes', quizPayload);
        }
      }

      setShowForm(false);
      setEditingLesson(null);
      setForm(DEFAULT_FORM);
      setVideoPreviewUrl(null);
      setFormVideoFile(null);
      setFormImageFile(null);
      // Reset quiz fields
      setQuizTitle('');
      setIsFinalQuiz(false);
      setNumberOfQuestions('');
      setQuestions([{ ...DEFAULT_QUESTION }]);
      setExistingQuiz(null);
      fetchData();
    } catch (err) {
      const message = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null) || err.message || 'An unknown error occurred';
      setErrorModalMessage(message);
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingLesson(null);
    setShowForm(false);
    setVideoPreviewUrl(null);
    setFormVideoFile(null);
    setFormImageFile(null);
    setQuizTitle('');
    setIsFinalQuiz(false);
    setNumberOfQuestions('');
    setQuestions([{ ...DEFAULT_QUESTION }]);
    setExistingQuiz(null);
  };

  // When editing a lesson, try to load its existing quiz
  const openEdit = async (lesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title || '',
      description: lesson.description || '',
      content: lesson.content || '',
      difficultyLevel: lesson.difficultyLevel || 'BEGINNER',
      status: lesson.status || 'DRAFT',
      courseId: lesson.courseId ? String(lesson.courseId) : '',
    });

    // Try to fetch existing quiz for this lesson
    try {
      const { data } = await api.get(`/quizzes/lesson/${lesson.lessonId}`);
      setExistingQuiz(data);
      setQuizTitle(data.title);
      setIsFinalQuiz(data.isFinalQuiz);
      setNumberOfQuestions(data.numberOfQuestions ? String(data.numberOfQuestions) : '');
      setQuestions(
        data.questions.map(q => ({
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
        }))
      );
    } catch (err) {
      // No existing quiz – leave defaults
      setExistingQuiz(null);
      setQuizTitle('');
      setIsFinalQuiz(false);
      setNumberOfQuestions('');
      setQuestions([{ ...DEFAULT_QUESTION }]);
    }

    setShowForm(true);
  };

  const openCreate = () => {
    setEditingLesson(null);
    setForm(DEFAULT_FORM);
    setQuizTitle('');
    setIsFinalQuiz(false);
    setNumberOfQuestions('');
    setQuestions([{ ...DEFAULT_QUESTION }]);
    setExistingQuiz(null);
    setShowForm(true);
  };

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : `Course #${courseId}`;
  };

  const truncate = (text, maxLen = 7) => {
    if (!text || typeof text !== 'string') return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '…' : text;
  };

  const getCreatorDisplay = () => currentUserFullName;
  const getCreatorNameForForm = () => currentUserFullName;

  const openMediaViewer = (sign, type) => {
    setViewingSign(sign);
    setViewingType(type);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: '#0A2956', fontWeight: 700 }}>My Lessons</h2>
        <button
          onClick={() => showForm ? resetForm() : openCreate()}
          style={{ padding: '0.6rem 1.5rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
        >
          {showForm ? 'Close Form' : '+ Add Lesson'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#FFF0F0', color: '#B00020', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid #FFCDD2' }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit}
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
        >
          {/* Lesson fields */}
          <input name="title" value={form.title} onChange={handleChange} placeholder="Lesson title" required style={inputStyle} />
          <select name="difficultyLevel" value={form.difficultyLevel} onChange={handleChange} style={inputStyle}>
            {DIFFICULTY_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
          <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="courseId" value={form.courseId} onChange={handleChange} style={inputStyle}>
            <option value="">No course</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <div style={{ gridColumn: 'span 2', fontSize: '0.9rem', color: '#64748B' }}>
            Created by: <strong>{getCreatorNameForForm()}</strong>
          </div>

          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" rows={2} required style={{ ...inputStyle, gridColumn: 'span 2', resize: 'vertical' }} />
          <textarea name="content" value={form.content} onChange={handleChange} placeholder="Lesson content" rows={4} required style={{ ...inputStyle, gridColumn: 'span 2', resize: 'vertical' }} />

          {/* Video upload for lesson */}
          <div style={{ gridColumn: 'span 2', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
            <label style={{ fontWeight: 500, color: '#0A2956', display: 'block', marginBottom: '0.5rem' }}>
              Add Sign (video/thumbnail) – will be linked to this lesson
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <button type="button" onClick={() => videoInputRef.current.click()} disabled={uploadingVideo} style={uploadButtonStyle}>
                  {uploadingVideo ? 'Uploading...' : 'Choose Video'}
                </button>
                <input type="file" ref={videoInputRef} onChange={handleVideoFileSelect} accept="video/*" style={{ display: 'none' }} />
                {videoPreviewUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <video ref={videoPreviewRef} src={videoPreviewUrl} controls style={{ width: '200px', borderRadius: '8px' }} />
                    <button type="button" onClick={captureThumbnail} style={{ ...uploadButtonStyle, marginTop: '0.25rem', fontSize: '0.8rem' }}>
                      Capture Thumbnail
                    </button>
                  </div>
                )}
              </div>
              <div>
                <button type="button" onClick={() => imageInputRef.current.click()} disabled={uploadingImage} style={uploadButtonStyle}>
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                </button>
                <input type="file" ref={imageInputRef} onChange={handleImageFileSelect} accept="image/*" style={{ display: 'none' }} />
                {formImageFile && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={URL.createObjectURL(formImageFile)} alt="Preview" style={{ width: '100px', borderRadius: '8px' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Quiz section (NEW) ── */}
          <div style={{ gridColumn: 'span 2', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
            <h4 style={{ color: '#0A2956', marginBottom: '0.5rem' }}>Quiz (optional)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input
                placeholder="Quiz Title"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
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
                placeholder="Questions per attempt (leave empty for all)"
                value={numberOfQuestions}
                onChange={e => setNumberOfQuestions(e.target.value)}
                min="1"
                style={inputStyle}
              />
            </div>

            {/* Questions */}
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
                <input placeholder="Question text" value={q.questionText} onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)} required style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input placeholder="Option A" value={q.optionA} onChange={e => handleQuestionChange(idx, 'optionA', e.target.value)} required style={inputStyle} />
                  <input placeholder="Option B" value={q.optionB} onChange={e => handleQuestionChange(idx, 'optionB', e.target.value)} required style={inputStyle} />
                  <input placeholder="Option C" value={q.optionC} onChange={e => handleQuestionChange(idx, 'optionC', e.target.value)} required style={inputStyle} />
                  <input placeholder="Option D" value={q.optionD} onChange={e => handleQuestionChange(idx, 'optionD', e.target.value)} required style={inputStyle} />
                </div>
                <select value={q.correctAnswer} onChange={e => handleQuestionChange(idx, 'correctAnswer', e.target.value)} style={inputStyle}>
                  <option value="A">Correct: A</option>
                  <option value="B">Correct: B</option>
                  <option value="C">Correct: C</option>
                  <option value="D">Correct: D</option>
                </select>
              </div>
            ))}

            <button type="button" onClick={addQuestion} style={{ padding: '0.5rem 1rem', background: '#F1F5F9', color: '#0A2956', border: '1px dashed #A8D8F5', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 500 }}>
              + Add Question
            </button>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ flex: 1, padding: '0.8rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              {editingLesson ? 'Update Lesson' : 'Create Lesson'}
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
        <input type="text" placeholder="Search lessons..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', color: '#0A2956', background: 'transparent' }} />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.1rem' }}>✕</button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#64748B' }}>Loading lessons...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Difficulty</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Course</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map(l => (
                <tr key={l.lessonId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={tdStyle} title={l.title}>{truncate(l.title, 7)}</td>
                  <td style={tdStyle}>{l.difficultyLevel}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: l.status === 'PUBLISHED' ? '#D2EFF9' : '#F1F5F9', color: '#0A2956', fontWeight: 500, fontSize: '0.85rem' }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={tdStyle} title={l.courseId ? getCourseTitle(l.courseId) : ''}>
                    {l.courseId ? truncate(getCourseTitle(l.courseId), 7) : '—'}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button onClick={() => setSelectedLesson(l)} style={iconButtonStyle} title="View details">👁️</button>
                      <button onClick={() => openEdit(l)} style={iconButtonStyle} title="Edit lesson">✏️</button>
                      <button onClick={() => openManageSigns(l)} style={iconButtonStyle} title="Manage signs">🔗</button>
                      <button onClick={() => setDeleteTargetId(l.lessonId)} style={{ ...iconButtonStyle, color: '#EF4444' }} title="Delete lesson">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLessons.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No lessons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLesson && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(10, 41, 86, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setSelectedLesson(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '550px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>{selectedLesson.title}</h3>
              <button onClick={() => setSelectedLesson(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DetailRow label="Lesson ID" value={selectedLesson.lessonId} />
              <DetailRow label="Title" value={selectedLesson.title} />
              <DetailRow label="Description" value={selectedLesson.description || '—'} />
              <DetailRow label="Content" value={selectedLesson.content || '—'} />
              <DetailRow label="Difficulty" value={selectedLesson.difficultyLevel} />
              <DetailRow label="Status" value={selectedLesson.status} />
              <DetailRow label="Course" value={selectedLesson.courseId ? getCourseTitle(selectedLesson.courseId) : 'None'} />
              <DetailRow label="Created at" value={new Date(selectedLesson.createdAt).toLocaleString()} />
              <DetailRow label="Updated at" value={new Date(selectedLesson.updatedAt).toLocaleString()} />
            </div>
            <button onClick={() => setSelectedLesson(null)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.7rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Manage Signs Modal */}
      {managingSignsFor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(10,41,86,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, padding: '1rem',
        }} onClick={() => setManagingSignsFor(null)}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', maxWidth: '600px', width: '100%',
            padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', overflow: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>
                Signs for: {managingSignsFor.title}
              </h3>
              <button onClick={() => setManagingSignsFor(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <select
                onChange={(e) => { if (e.target.value) handleAddSign(e.target.value); }}
                defaultValue=""
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #E2E8F0',
                  fontSize: '0.95rem', color: '#0A2956', background: '#F8FAFC',
                }}
              >
                <option value="" disabled>+ Add a sign...</option>
                {allSigns
                  .filter((s) => !lessonSigns.some((ls) => ls.signId === s.signId))
                  .map((s) => (
                    <option key={s.signId} value={s.signId}>{s.signName}</option>
                  ))}
              </select>
            </div>

            {lessonSigns.length === 0 ? (
              <p style={{ color: '#64748B', textAlign: 'center' }}>No signs attached yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto', flex: 1 }}>
                {lessonSigns.map((sign) => (
                  <li key={sign.signId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0', borderBottom: '1px solid #F1F5F9',
                  }}>
                    <span>
                      <strong>{sign.signName}</strong>
                      {sign.videoUrl && (
                        <button
                          onClick={() => openMediaViewer(sign, 'video')}
                          style={{ marginLeft: '0.75rem', color: '#135290', fontSize: '0.85rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          ▶ Video
                        </button>
                      )}
                      {sign.imageUrl && (
                        <button
                          onClick={() => openMediaViewer(sign, 'image')}
                          style={{ marginLeft: '0.75rem', color: '#135290', fontSize: '0.85rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          🖼 Image
                        </button>
                      )}
                    </span>
                    <button
                      onClick={() => handleRemoveSign(sign.signId)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      {viewingSign && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 3000,
        }} onClick={() => setViewingSign(null)}>
          <div style={{
            background: '#FFFFFF', borderRadius: '12px', padding: '1.5rem',
            maxWidth: '80%', width: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0A2956', margin: 0 }}>{viewingSign.signName}</h3>
              <button onClick={() => setViewingSign(null)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
            </div>
            {viewingType === 'video' && viewingSign.videoUrl && (
              <video controls autoPlay src={getMediaUrl(viewingSign.videoUrl)} style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh' }} />
            )}
            {viewingType === 'image' && viewingSign.imageUrl && (
              <img src={getMediaUrl(viewingSign.imageUrl)} alt={viewingSign.signName} style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh' }} />
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
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>{editingLesson ? 'Update Failed' : 'Creation Failed'}</h3>
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
              <h3 style={{ color: '#0A2956', fontWeight: 700, margin: 0 }}>Delete Lesson?</h3>
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

const inputStyle = { padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', color: '#0A2956', background: '#F8FAFC', transition: 'border 0.2s' };
const uploadButtonStyle = { padding: '0.5rem 1rem', background: '#0A2956', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' };
const thStyle = { padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#0A2956', fontSize: '0.9rem' };
const tdStyle = { padding: '0.75rem', color: '#334155', fontSize: '0.95rem' };
const iconButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.2rem', color: '#135290', display: 'flex', alignItems: 'center' };