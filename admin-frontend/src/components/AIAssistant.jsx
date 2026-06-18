import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Separate instance – no global 401 redirect so we can show a friendly message
const aiApi = axios.create({ baseURL: '/api' });
aiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [interactionId, setInteractionId] = useState(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  // Auto‑scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    // If not logged in, show prompt immediately (no API call)
    const token = localStorage.getItem('token');
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { type: 'user', text: question },
        { type: 'system', text: 'Please sign in to use the AI assistant.' },
      ]);
      setInput('');
      return;
    }

    // --- Logged in: proceed with API call ---
    const userMsg = { type: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setInteractionId(null);

    try {
      const { data } = await aiApi.post('/ai/ask', { question });
      const aiMsg = { type: 'ai', text: data.answer };
      setMessages((prev) => [...prev, aiMsg]);
      setInteractionId(data.interactionId);
    } catch (err) {
      if (err.response?.status === 401) {
        // Fallback in case the token was cleared after sending
        setMessages((prev) => [
          ...prev,
          { type: 'system', text: 'Please sign in to use the AI assistant.' },
        ]);
      } else {
        const serverMsg =
          err.response?.data?.message || err.response?.data || err.message || 'Unexpected error';
        setMessages((prev) => [
          ...prev,
          { type: 'system', text: `Error: ${serverMsg}` },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (helpful) => {
    if (!interactionId) return;
    try {
      await aiApi.post(`/ai/feedback/${interactionId}`, null, {
        params: { helpful },
      });
      setInteractionId(null); // disable further feedback on this answer
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          text: helpful
            ? 'Thanks for your feedback! 👍'
            : 'Thanks for your feedback. We’ll improve! 👎',
        },
      ]);
    } catch {
      // silently fail
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#0A2956',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 12px rgba(10,41,86,0.3)',
          cursor: 'pointer',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        🤖
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '5rem',
            right: '1.5rem',
            width: 'min(90vw, 380px)',
            height: 'min(80vh, 520px)',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(10,41,86,0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#0A2956',
              color: '#FFFFFF',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600 }}>🤖 PalmPulse AI</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#D2EFF9',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {messages.length === 0 && (
              <p style={{ color: '#64748B', textAlign: 'center', marginTop: '2rem' }}>
                Ask me anything about sign language!
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.type === 'system' ? (
                  <p
                    style={{
                      color: '#0A2956',
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                      width: '100%',
                    }}
                  >
                    {msg.text}
                    {msg.text.includes('sign in') && <span> </span>}
                    {msg.text.includes('sign in') && (
                      <Link
                        to="/login"
                        style={{ color: '#0A2956', fontWeight: 600 }}
                        onClick={() => setOpen(false)}
                      >
                        Log in
                      </Link>
                    )}
                  </p>
                ) : (
                  <div
                    style={{
                      maxWidth: '80%',
                      background: msg.type === 'user' ? '#0A2956' : '#F8FAFC',
                      color: msg.type === 'user' ? '#FFFFFF' : '#0A2956',
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      border: msg.type === 'ai' ? '1px solid #E2E8F0' : 'none',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                    }}
                  >
                    {msg.text}
                  </div>
                )}
                {/* Feedback buttons for AI answer */}
                {msg.type === 'ai' && i === messages.length - 1 && interactionId && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      onClick={() => sendFeedback(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      👍
                    </button>
                    <button
                      onClick={() => sendFeedback(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      👎
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a sign language question..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #E2E8F0',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#0A2956',
                  background: '#F8FAFC',
                }}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  padding: '0.75rem 1.2rem',
                  background: loading ? '#A8D8F5' : '#0A2956',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}