import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function MyContent() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [signs, setSigns] = useState([]);
  const [loadingSigns, setLoadingSigns] = useState(false);
  const [viewingSign, setViewingSign] = useState(null);
  const [viewingType, setViewingType] = useState('video'); // 'video' or 'image'

  const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8085${path}`;
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses/my');
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseClick = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      setExpandedLesson(null);
      setLessons([]);
      setSigns([]);
      return;
    }
    setExpandedCourse(courseId);
    setExpandedLesson(null);
    setSigns([]);
    setLoadingLessons(true);
    try {
      const { data } = await api.get(`/courses/${courseId}/lessons`);
      setLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleLessonClick = async (lessonId) => {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null);
      setSigns([]);
      return;
    }
    setExpandedLesson(lessonId);
    setLoadingSigns(true);
    try {
      const { data } = await api.get(`/lessons/${lessonId}/signs`);
      setSigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch signs:', err);
    } finally {
      setLoadingSigns(false);
    }
  };

  if (loading) return <p style={{ color: '#64748B' }}>Loading your content...</p>;

  return (
    <div>
      <h2 style={{ color: '#0A2956', fontWeight: 700, marginBottom: '1.5rem' }}>
        My Content
      </h2>

      {courses.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}>
          <p style={{ color: '#64748B', fontSize: '1.1rem', marginBottom: '1rem' }}>
            You haven’t created any courses yet.
          </p>
          <a href="/admin/courses" style={{
            color: '#135290',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Create your first course →
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {courses.map(course => (
            <div key={course.id} style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s',
            }}>
              {/* Course Header */}
              <div
                onClick={() => handleCourseClick(course.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#0A2956',
                  background: '#F8FAFC',
                  borderBottom: expandedCourse === course.id ? '1px solid #E2E8F0' : 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#D2EFF9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}>📘</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{course.title}</div>
                    {!expandedCourse && course.description && (
                      <p style={{
                        color: '#475569',
                        fontSize: '0.85rem',
                        marginTop: '0.25rem',
                        marginBottom: 0,
                        fontWeight: 400,
                      }}>{course.description}</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    color: '#64748B',
                    background: '#F1F5F9',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                  }}>
                    {course.status} • {course.difficultyLevel}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#64748B' }}>
                    {expandedCourse === course.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedCourse === course.id && (
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {/* Show description when expanded too */}
                  <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {course.description}
                  </p>

                  {loadingLessons ? (
                    <p style={{ color: '#64748B' }}>Loading lessons...</p>
                  ) : lessons.length === 0 ? (
                    <p style={{ color: '#64748B', fontStyle: 'italic' }}>
                      No lessons in this course yet.
                    </p>
                  ) : (
                    <div style={{ borderLeft: '2px solid #D2EFF9', paddingLeft: '1rem' }}>
                      {lessons.map(lesson => (
                        <div key={lesson.lessonId} style={{ marginBottom: '0.5rem' }}>
                          <div
                            onClick={() => handleLessonClick(lesson.lessonId)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              fontWeight: 500,
                              color: '#135290',
                              padding: '0.6rem',
                              borderRadius: '8px',
                              background: '#F8FAFC',
                              marginBottom: '0.25rem',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                            onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                          >
                            <span>{lesson.title}</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                              {lesson.status} • {lesson.difficultyLevel}
                            </span>
                          </div>

                          {expandedLesson === lesson.lessonId && (
                            <div style={{ paddingLeft: '1rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                              {loadingSigns ? (
                                <p style={{ color: '#64748B' }}>Loading signs...</p>
                              ) : signs.length === 0 ? (
                                <p style={{ color: '#64748B', fontStyle: 'italic' }}>
                                  No signs attached.
                                </p>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                  {signs.map(sign => {
                                    const videoUrl = getMediaUrl(sign.videoUrl);
                                    const imageUrl = getMediaUrl(sign.imageUrl);
                                    return (
                                      <div key={sign.signId} style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        width: '180px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                        transition: 'transform 0.2s',
                                      }}>
                                        <div
                                          onClick={() => {
                                            if (videoUrl) {
                                              setViewingSign(sign);
                                              setViewingType('video');
                                            } else if (imageUrl) {
                                              setViewingSign(sign);
                                              setViewingType('image');
                                            }
                                          }}
                                          style={{
                                            height: '100px',
                                            background: imageUrl ? `url(${imageUrl}) center/cover` : '#D2EFF9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: (videoUrl || imageUrl) ? 'pointer' : 'default',
                                            position: 'relative',
                                          }}
                                        >
                                          {!imageUrl && videoUrl && (
                                            <span style={{ fontSize: '1.5rem', color: '#0A2956' }}>▶️</span>
                                          )}
                                          {!videoUrl && !imageUrl && (
                                            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>No media</span>
                                          )}
                                        </div>
                                        <div style={{ padding: '0.5rem', textAlign: 'center', background: '#F8FAFC' }}>
                                          <strong style={{ fontSize: '0.85rem', color: '#0A2956' }}>
                                            {sign.signName}
                                          </strong>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Viewer Modal – unchanged */}
      {viewingSign && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
          }}
          onClick={() => setViewingSign(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '80%',
              width: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0A2956', margin: 0 }}>{viewingSign.signName}</h3>
              <button
                onClick={() => setViewingSign(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>
            {viewingType === 'video' && viewingSign.videoUrl && (
              <video
                controls
                autoPlay
                src={getMediaUrl(viewingSign.videoUrl)}
                style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh' }}
              />
            )}
            {viewingType === 'image' && viewingSign.imageUrl && (
              <img
                src={getMediaUrl(viewingSign.imageUrl)}
                alt={viewingSign.signName}
                style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh' }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}