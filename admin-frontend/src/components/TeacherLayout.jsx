import { Link, Outlet } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import Footer from './Footer';
import welcomeImg from '../assets/welcom sign image.png';

const navItems = [
    { to: '/teacher/dashboard', label: 'Dashboard' },
    { to: '/teacher/courses',  label: 'My Courses' },
  { to: '/teacher/lessons', label: 'My Lessons' },
  { to: '/teacher/signs',    label: 'My Signs' },
  { to: '/teacher/enrollments', label: 'Enrollments' },
  { to: '/teacher/quizzes', label: 'Quizzes' },
  { to: '/teacher/my-content', label: 'My Content' },


];

export default function TeacherLayout() {
  return (
    <>
      <DashboardNavbar />

      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Blurred background image */}
        <img
          src={welcomeImg}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'left center',
            filter: 'blur(3px)',
            zIndex: -2,
          }}
        />

        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(10,41,86,0.1) 0%, rgba(10,41,86,0.45) 50%, rgba(10,41,86,0.7) 100%)',
          zIndex: -1,
        }} />

        {/* Glass Sidebar (reduced width) */}
        <aside style={{
          width: 180,   // ← reduced from
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)',
          color: '#FFFFFF',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}>
          <h2 style={{
            color: '#FFFFFF',
            marginBottom: '2rem',
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: '0.5px',
            textShadow: '1px 1px 4px rgba(0,0,0,0.3)',
          }}>
          </h2>
          <nav style={{ flex: 1 }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {navItems.map(item => (
                <li key={item.to} style={{ marginBottom: '0.35rem' }}>
                  <Link
                    to={item.to}
                    style={{
                      display: 'block',
                      padding: '0.6rem 0.75rem',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      transition: 'background 0.2s, padding-left 0.2s',
                      textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                      e.target.style.paddingLeft = '1rem';
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = 'transparent';
                      e.target.style.paddingLeft = '0.75rem';
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '2rem', background: '#FFFFFF', position: 'relative', zIndex: 1 }}>
          <Outlet />
        </main>
      </div>

      <Footer />
    </>
  );
}