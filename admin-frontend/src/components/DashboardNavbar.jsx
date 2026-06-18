import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';

export default function DashboardNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Shorten the displayed name – first name or email prefix
  const displayName = user.fullName
    ? user.fullName.split(' ')[0]
    : (user.email ? user.email.split('@')[0] : 'User');

  // Paths based on role
  const profilePath = user.role === 'ADMIN' ? '/admin/profile' : '/teacher/profile';

  // Profile picture URL (with fallback to initial)
  const profilePicUrl = user.profilePictureUrl
    ? (user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `http://localhost:8085${user.profilePictureUrl}`)
    : null;

  return (
    <header style={{
      background: '#0A2956',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      {/* Brand */}
      <Link to="/dashboard" style={{
        fontWeight: 700,
        fontSize: '1.3rem',
        color: '#FFFFFF',
        textDecoration: 'none',
      }}>
        PalmPulse
      </Link>

      {/* Right side – notification bell + user dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <NotificationBell />

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#D2EFF9',
              fontWeight: 500,
              fontSize: '0.95rem',
              padding: '0.5rem',
              borderRadius: '8px',
            }}
          >
            {/* Avatar – always show image if available, else initial */}
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt=""
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <span style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#D2EFF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#0A2956',
                fontSize: '0.9rem',
              }}>
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <span>{displayName}</span>
            {/* Chevron */}
            <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>▼</span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              border: '1px solid #E2E8F0',
              minWidth: '180px',
              zIndex: 100,
              overflow: 'hidden',
            }}>
              <Link to={profilePath} style={dropdownItemStyle} onClick={() => setDropdownOpen(false)}>
                <span>👤</span> Edit Profile
              </Link>
              <Link to={profilePath + '?tab=password'} style={dropdownItemStyle} onClick={() => setDropdownOpen(false)}>
                <span>🔒</span> Change Password
              </Link>
              <button
                onClick={() => { handleLogout(); setDropdownOpen(false); }}
                style={{
                  ...dropdownItemStyle,
                  border: 'none',
                  background: 'none',
                  width: '100%',
                  cursor: 'pointer',
                  color: '#B00020',
                }}
              >
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  textDecoration: 'none',
  color: '#0A2956',
  fontWeight: 500,
  fontSize: '0.95rem',
  borderBottom: '1px solid #F1F5F9',
  transition: 'background 0.2s',
};