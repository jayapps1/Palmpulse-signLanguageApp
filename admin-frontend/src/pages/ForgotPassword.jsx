import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');   // 'phone' | 'code' | 'reset' | 'done'
  const [tempToken, setTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Six‑digit code state & refs ---
  const [codeDigits, setCodeDigits] = useState(Array(6).fill(''));
  const inputRefs = useRef([]);

  // Keep `code` in sync with the individual digits
  useEffect(() => {
    setCode(codeDigits.join(''));
  }, [codeDigits]);

  // Focus management helpers
  const focusNext = (index) => {
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const focusPrev = (index) => {
    if (index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleDigitChange = (index, value) => {
    // Allow only a single digit
    const digit = value.replace(/\D/g, '').slice(0, 1);
    if (digit) {
      const newDigits = [...codeDigits];
      newDigits[index] = digit;
      setCodeDigits(newDigits);
      focusNext(index);
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (codeDigits[index] === '') {
        // If current box is empty, move back and clear that one
        const newDigits = [...codeDigits];
        if (index > 0) {
          newDigits[index - 1] = '';
          setCodeDigits(newDigits);
          focusPrev(index);
        }
      } else {
        // Otherwise just clear current box
        const newDigits = [...codeDigits];
        newDigits[index] = '';
        setCodeDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft') {
      focusPrev(index);
    } else if (e.key === 'ArrowRight') {
      focusNext(index);
    }
  };

  // Handle paste of a full code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length) {
      const newDigits = [...codeDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setCodeDigits(newDigits);
      // Focus last filled or first empty
      const lastIndex = pasted.length - 1;
      if (lastIndex < 5) {
        inputRefs.current[lastIndex + 1]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  // Step 1 – Send code
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { phoneNumber });
      setMessage(data.message);
      setStep('code');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 – Verify code
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-code', { phoneNumber, code });
      setTempToken(data.tempToken);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 – Set new password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { tempToken, newPassword });
      setMessage(data.message);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

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
    transition: 'border 0.2s, box-shadow 0.2s, background 0.2s',
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
    transition: 'background 0.2s, transform 0.1s',
  });

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
      {/* ── Phone Step ── */}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} style={cardStyle}>
          {/* Logo / Branding */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              color: '#0A2956',
              fontWeight: 700,
              fontSize: '2rem',
              margin: 0,
              letterSpacing: '-0.5px',
            }}>
              PalmPulse
            </h2>
            <p style={{
              color: '#64748B',
              marginTop: '0.4rem',
              fontSize: '0.95rem',
            }}>
              Forgot your password?
            </p>
            <p style={{
              color: '#94A3B8',
              marginTop: '0.25rem',
              fontSize: '0.85rem',
            }}>
              Enter your phone number to receive a verification code.
            </p>
          </div>

          {error && (
            <div style={{
              background: '#FFF0F0',
              color: '#B00020',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              border: '1px solid #FFCDD2',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ color: '#0A2956', fontWeight: 600, fontSize: '0.85rem' }}>Phone Number</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute',
                left: '1rem',
                color: '#94A3B8',
                fontSize: '1rem',
                pointerEvents: 'none',
              }}>
                📱
              </span>
              <input
                type="tel"
                placeholder="+233 50 123 4567"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
                style={{ ...inputStyle, paddingLeft: '2.8rem' }}
                onFocus={e => {
                  e.target.style.borderColor = '#6EB7EA';
                  e.target.style.boxShadow = '0 0 0 3px rgba(110, 183, 234, 0.2)';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#F8FAFC';
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle(loading)}
            onMouseEnter={e => { if (!loading) { e.target.style.background = '#135290'; e.target.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { if (!loading) { e.target.style.background = '#0A2956'; e.target.style.transform = 'translateY(0)'; } }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Sending…
              </span>
            ) : (
              'Send Code'
            )}
          </button>

          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: '#0A2956', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
          </p>
        </form>
      )}

      {/* ── Code Verification Step (with six square boxes) ── */}
      {step === 'code' && (
        <form onSubmit={handleCodeSubmit} style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#0A2956', fontWeight: 700, fontSize: '2rem' }}>
              Verify Code
            </h2>
            <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
              Enter the 6‑digit code sent to your phone.
            </p>
          </div>

          {message && (
            <div style={{
              background: '#E8F5E9',
              color: '#2E7D32',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              border: '1px solid #C8E6C9',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>✅</span> {message}
            </div>
          )}

          {error && (
            <div style={{
              background: '#FFF0F0',
              color: '#B00020',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              border: '1px solid #FFCDD2',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Six square digit inputs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
            onPaste={handlePaste}
          >
            {codeDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                onFocus={(e) => {
                  e.target.select();
                  e.target.style.borderColor = '#6EB7EA';
                  e.target.style.boxShadow = '0 0 0 3px rgba(110, 183, 234, 0.2)';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#F8FAFC';
                }}
                style={{
                  width: '48px',
                  height: '48px',
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#0A2956',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border 0.2s, box-shadow 0.2s, background 0.2s',
                }}
              />
            ))}
          </div>

          <button type="submit" disabled={loading || code.length !== 6} style={buttonStyle(loading)}>
            {loading ? 'Verifying…' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('phone'); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0A2956',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem',
              alignSelf: 'center',
            }}
          >
            ← Use a different phone number
          </button>
        </form>
      )}

      {/* ── Reset Password Step ── */}
      {step === 'reset' && (
        <form onSubmit={handleResetSubmit} style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#0A2956', fontWeight: 700, fontSize: '2rem' }}>
              New Password
            </h2>
            <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
              Choose a strong, new password.
            </p>
          </div>

          {error && (
            <div style={{
              background: '#FFF0F0',
              color: '#B00020',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              border: '1px solid #FFCDD2',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ color: '#0A2956', fontWeight: 600, fontSize: '0.85rem' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>🔒</span>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingLeft: '2.8rem' }}
                onFocus={e => { e.target.style.borderColor = '#6EB7EA'; e.target.style.boxShadow = '0 0 0 3px rgba(110, 183, 234, 0.2)'; e.target.style.background = '#FFFFFF'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ color: '#0A2956', fontWeight: 600, fontSize: '0.85rem' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>🔒</span>
              <input
                type="password"
                placeholder="Re‑enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingLeft: '2.8rem' }}
                onFocus={e => { e.target.style.borderColor = '#6EB7EA'; e.target.style.boxShadow = '0 0 0 3px rgba(110, 183, 234, 0.2)'; e.target.style.background = '#FFFFFF'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle(loading)}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      )}

      {/* ── Done / Success ── */}
      {step === 'done' && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
            <h2 style={{ color: '#0A2956', fontWeight: 700, fontSize: '2rem' }}>Password Reset</h2>
            <p style={{ color: '#2E7D32', marginTop: '0.5rem', fontSize: '0.95rem' }}>{message}</p>
          </div>
          <Link
            to="/login"
            style={{
              textAlign: 'center',
              color: '#0A2956',
              fontWeight: 600,
              textDecoration: 'none',
              background: '#F8FAFC',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = '#F1F5F9'}
            onMouseLeave={e => e.target.style.background = '#F8FAFC'}
          >
            Go to Login
          </Link>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}