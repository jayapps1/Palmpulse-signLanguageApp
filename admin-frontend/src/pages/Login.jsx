import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');

  const navigate = useNavigate();

  // ── Shared styles ──
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(10, 41, 86, 0.15)',
    border: '1px solid rgba(168, 216, 245, 0.5)',
    padding: '3rem 2.5rem',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: '1.5px solid #E2E8F0',
    outline: 'none',
    fontSize: '0.95rem',
    color: '#0A2956',
    background: '#F8FAFC',
    fontFamily: 'inherit',
  };

  const buttonStyle = (isLoading) => ({
    padding: '0.9rem',
    background: isLoading ? '#A8D8F5' : '#0A2956',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    boxShadow: '0 4px 6px -1px rgba(10, 41, 86, 0.2)',
    fontFamily: 'inherit',
  });

  // Step 1 – email + password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });

      if (data.requires2FA) {
        setRequires2FA(true);
        setTempToken(data.tempToken);
        setMaskedPhone(data.maskedPhone || 'your phone');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 – 2FA code verification
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login-2fa', {
        tempToken,
        code: twoFACode,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF',
      padding: '1rem',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {requires2FA ? (
        <form onSubmit={handle2FASubmit} style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#0A2956', fontWeight: 700, fontSize: '2rem' }}>
              Verify Code
            </h2>
            <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
              Enter the 6‑digit code sent to {maskedPhone}.
            </p>
          </div>

          {error && (
            <div style={{
              background: '#FFF0F0', color: '#B00020', padding: '0.75rem 1rem',
              borderRadius: '10px', fontSize: '0.9rem', border: '1px solid #FFCDD2',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <input
            type="text"
            placeholder="000000"
            value={twoFACode}
            onChange={e => setTwoFACode(e.target.value)}
            maxLength={6}
            required
            style={{
              ...inputStyle,
              textAlign: 'center',
              letterSpacing: '0.5rem',
            }}
          />

          <button type="submit" disabled={loading} style={buttonStyle(loading)}>
            {loading ? 'Verifying…' : 'Verify & Login'}
          </button>

          <p style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setRequires2FA(false); setError(''); }}
              style={{
                background: 'none', border: 'none', color: '#0A2956',
                cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem',
              }}
            >
              ← Back to login
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              color: '#0A2956', fontWeight: 700, fontSize: '2rem',
              margin: 0, letterSpacing: '-0.5px',
            }}>
              PalmPulse
            </h2>
            <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
              Sign in to your dashboard
            </p>
          </div>

          {error && (
            <div style={{
              background: '#FFF0F0', color: '#B00020', padding: '0.75rem 1rem',
              borderRadius: '10px', fontSize: '0.9rem', border: '1px solid #FFCDD2',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ color: '#0A2956', fontWeight: 600, fontSize: '0.85rem' }}>Email</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '1rem', color: '#94A3B8', fontSize: '1rem' }}>✉️</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ ...inputStyle, paddingLeft: '2.8rem' }}
                onFocus={e => { e.target.style.borderColor = '#6EB7EA'; e.target.style.boxShadow = '0 0 0 3px rgba(110, 183, 234, 0.2)'; e.target.style.background = '#FFFFFF'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ color: '#0A2956', fontWeight: 600, fontSize: '0.85rem' }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '1rem', color: '#94A3B8', fontSize: '1rem' }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingLeft: '2.8rem', paddingRight: '3rem' }}
                onFocus={e => { e.target.style.borderColor = '#6EB7EA'; e.target.style.boxShadow = '0 0 0 3px rgba(110, 183, 234, 0.2)'; e.target.style.background = '#FFFFFF'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '0.9rem' }} tabIndex={-1}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{
              color: '#135290', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500,
            }}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle(loading)}
            onMouseEnter={e => { if (!loading) { e.target.style.background = '#135290'; e.target.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { if (!loading) { e.target.style.background = '#0A2956'; e.target.style.transform = 'translateY(0)'; } }}
          >
            {loading ? 'Signing in…' : 'Log In'}
          </button>

          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
            Don’t have an account?{' '}
            <Link to="/register" style={{ color: '#0A2956', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </p>

          <p style={{
            textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem',
            margin: 0, background: '#F8FAFC', padding: '0.5rem', borderRadius: '8px',
          }}>
            Demo: admin@palmpulse.com / Admin123!
          </p>
        </form>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}