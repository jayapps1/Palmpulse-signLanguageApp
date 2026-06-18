import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#0A2956',
      color: '#FFFFFF',
      padding: '3rem 2rem 1.5rem',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div className="footer-grid" style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        {/* Brand column */}
        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ color: '#D2EFF9', fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            PalmPulse
          </h3>
          <p style={{ color: '#A8D8F5', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Empowering sign language learning through interactive courses and AI.
          </p>
        </div>

        {/* Quick Links */}
        <div style={{ flex: '1 1 150px' }}>
          <h4 style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '0.75rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/" style={{ color: '#A8D8F5', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/features" style={{ color: '#A8D8F5', textDecoration: 'none', fontSize: '0.9rem' }}>Features</Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/about" style={{ color: '#A8D8F5', textDecoration: 'none', fontSize: '0.9rem' }}>About</Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/contact" style={{ color: '#A8D8F5', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="#student-app" style={{ color: '#A8D8F5', textDecoration: 'none', fontSize: '0.9rem' }}>Student App</a>
            </li>
          </ul>
        </div>

        {/* Contact / Info */}
        <div style={{ flex: '1 1 150px' }}>
          <h4 style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '0.75rem' }}>Contact</h4>
          <p style={{ color: '#A8D8F5', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            info@palmpulse.com
          </p>
          <p style={{ color: '#A8D8F5', fontSize: '0.9rem' }}>
            Accra, Ghana
          </p>
        </div>

        {/* Social Media – with proper brand colours */}
        <div style={{ flex: '1 1 150px' }}>
          <h4 style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '0.75rem' }}>Follow Us</h4>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {socialLinks.map((social, i) => (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: social.bg,          // brand colour
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.2)',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        textAlign: 'center',
        color: '#A8D8F5',
        fontSize: '0.85rem',
      }}>
        &copy; {new Date().getFullYear()} PalmPulse. All rights reserved.
      </div>
    </footer>
  );
}

const socialLinks = [
  { url: 'https://facebook.com', label: 'Facebook', icon: 'f', bg: '#1877F2' },
  { url: 'https://twitter.com',  label: 'Twitter',  icon: '𝕏', bg: '#000000' },
  { url: 'https://linkedin.com', label: 'LinkedIn',  icon: 'in', bg: '#0A66C2' },
];