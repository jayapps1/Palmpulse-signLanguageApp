import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/register', form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white',
      padding: '1rem',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(10, 41, 86, 0.08)',
        border: '1px solid var(--soft-sky)',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            color: 'var(--dark-navy)',
            fontWeight: 700,
            fontSize: '1.8rem',
            margin: 0,
          }}>
            Create Account
          </h2>
          <p style={{ color: '#666', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Join PalmPulse today
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FFF0F0',
            color: '#B00020',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            fontSize: '0.9rem',
            border: '1px solid #FFCDD2',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            fontSize: '0.9rem',
            border: '1px solid #C8E6C9',
          }}>
            {success}
          </div>
        )}

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ color: 'var(--dark-navy)', fontWeight: 500, fontSize: '0.85rem' }}>Full Name</span>
          <input
            type="text"
            name="fullName"
            placeholder="John Doe"
            value={form.fullName}
            onChange={handleChange}
            required
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 8,
              border: '1.5px solid var(--soft-sky)',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--dark-navy)',
              transition: 'border 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--bright-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--soft-sky)'}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ color: 'var(--dark-navy)', fontWeight: 500, fontSize: '0.85rem' }}>Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 8,
              border: '1.5px solid var(--soft-sky)',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--dark-navy)',
              transition: 'border 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--bright-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--soft-sky)'}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ color: 'var(--dark-navy)', fontWeight: 500, fontSize: '0.85rem' }}>Password</span>
          <input
            type="password"
            name="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 8,
              border: '1.5px solid var(--soft-sky)',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--dark-navy)',
              transition: 'border 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--bright-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--soft-sky)'}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ color: 'var(--dark-navy)', fontWeight: 500, fontSize: '0.85rem' }}>Phone Number</span>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="+1234567890"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 8,
              border: '1.5px solid var(--soft-sky)',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--dark-navy)',
              transition: 'border 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--bright-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--soft-sky)'}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.9rem',
            background: loading ? 'var(--soft-sky)' : 'var(--dark-navy)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
            marginTop: '0.5rem',
          }}
          onMouseEnter={e => {
            if (!loading) e.target.style.background = 'var(--medium-blue)';
          }}
          onMouseLeave={e => {
            if (!loading) e.target.style.background = 'var(--dark-navy)';
          }}
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>

        <p style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '0.9rem',
          margin: 0,
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: 'var(--dark-navy)',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}