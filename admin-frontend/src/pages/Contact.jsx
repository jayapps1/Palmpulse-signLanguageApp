import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you could send the form to a backend endpoint if you create one
    // For now we just show a thank-you message
    setSent(true);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />
      <section style={{
        padding: '5rem 2rem',
        maxWidth: '600px',
        margin: '0 auto',
        color: '#0A2956',
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          Contact Us
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '2rem', lineHeight: '1.6' }}>
          Have a question, feedback, or need support? We’d love to hear from you.
        </p>

        {sent ? (
          <div style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            Thank you! We’ll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontWeight: 600 }}>Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Your name"
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontWeight: 600 }}>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="you@example.com"
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontWeight: 600 }}>Message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                style={{ ...inputStyle, minHeight: '120px' }}
                placeholder="How can we help?"
              />
            </label>
            <button
              type="submit"
              style={{
                padding: '0.9rem',
                background: '#0A2956',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = '#135290'}
              onMouseLeave={e => e.target.style.background = '#0A2956'}
            >
              Send Message
            </button>
          </form>
        )}
      </section>
      <Footer />
    </div>
  );
}

const inputStyle = {
  padding: '0.85rem 1rem',
  borderRadius: '8px',
  border: '1.5px solid #E2E8F0',
  outline: 'none',
  fontSize: '1rem',
  color: '#0A2956',
  background: '#F8FAFC',
  transition: 'border 0.2s',
};