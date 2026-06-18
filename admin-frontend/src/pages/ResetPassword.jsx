import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, newPassword: password });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h2 style={{ color: '#0A2956' }}>Invalid reset link</h2>
        <Link to="/forgot-password" style={{ color: '#0A2956' }}>Request a new one</Link>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF',
      padding: '1rem',
    }}>
      <form onSubmit={handleSubmit} style={{
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
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#0A2956', fontWeight: 700, fontSize: '1.8rem' }}>
            Reset Password
          </h2>
          <p style={{ color: '#64748B', marginTop: '0.5rem' }}>
            Enter your new password.
          </p>
        </div>

        {message && (
          <div style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '0.75rem',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            {message}
            <br />
            <Link to="/login" style={{ color: '#0A2956', fontWeight: 600 }}>Go to login</Link>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FFF0F0',
            color: '#B00020',
            padding: '0.75rem',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1.5px solid #E2E8F0',
            outline: 'none',
            fontSize: '1rem',
            color: '#0A2956',
          }}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1.5px solid #E2E8F0',
            outline: 'none',
            fontSize: '1rem',
            color: '#0A2956',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.9rem',
            background: '#0A2956',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}