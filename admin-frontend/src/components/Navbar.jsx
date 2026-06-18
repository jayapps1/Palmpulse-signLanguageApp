import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkStyle = {
    color: '#D2EFF9',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'block',
    padding: '0.5rem 0',
  };

  const linkItems = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/features', label: 'Features' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav style={{
      background: '#0A2956',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '1rem 2rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontWeight: 700,
          fontSize: '1.6rem',
          color: '#FFFFFF',
          textDecoration: 'none',
        }}>
          PalmPulse
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}
          className="desktop-nav"
        >
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {linkItems.map(item => (
              <Link key={item.to} to={item.to} style={navLinkStyle}>
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            to="/login"
            style={{
              padding: '0.6rem 1.8rem',
              background: '#FFFFFF',
              color: '#0A2956',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
            }}
          >
            Sign In
          </Link>
        </div>

        {/* Hamburger icon (visible on mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '1.8rem',
            cursor: 'pointer',
            display: 'none',   // hidden by default; we'll show via CSS
          }}
          className="hamburger"
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
          className="mobile-menu"
        >
          {linkItems.map(item => (
            <Link key={item.to} to={item.to} style={navLinkStyle}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/login"
            style={{
              padding: '0.6rem 1.8rem',
              background: '#FFFFFF',
              color: '#0A2956',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              alignSelf: 'flex-start',
              marginTop: '0.5rem',
            }}
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
}