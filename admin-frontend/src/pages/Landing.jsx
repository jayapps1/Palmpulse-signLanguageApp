import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import welcomeImg from '../assets/welcom sign image.png';

export default function Landing() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />

      {/* Hero Section – blurred image shifted left, card right */}
      <section
        className="section-padding hero-section-mobile-center"
        style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',   // card stays right
          padding: '2rem',
          zIndex: 0,
          overflow: 'hidden',           // clip blur edges
        }}
      >
        {/* Blurred background image – shifted left */}
        <img
          src={welcomeImg}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'left center',   // shift image content left
            filter: 'blur(3px)',             // subtle blur
            zIndex: -2,
          }}
        />

        {/* Gradient overlay – left lighter, right darker */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgba(10,41,86,0.1) 0%, rgba(10,41,86,0.45) 50%, rgba(10,41,86,0.7) 100%)',
            zIndex: -1,
          }}
        />

        {/* Glassmorphism card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            padding: '3rem 2.5rem',
            maxWidth: '650px',
            width: '100%',
            textAlign: 'center',
            color: '#FFFFFF',
            marginRight: '2rem',
          }}
        >
          <h1
            className="hero-title"
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1rem',
              letterSpacing: '-0.5px',
              textShadow: '2px 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            Learn Sign Language with PalmPulse
          </h1>
          <p
            className="hero-subtitle"
            style={{
              fontSize: '1.2rem',
              marginBottom: '2.5rem',
              lineHeight: '1.6',
              opacity: 0.95,
            }}
          >
            Interactive courses, AI‑powered assistance, and progress tracking – built
            for students, guided by teachers.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="#student-app"
              style={{
                padding: '0.85rem 2.2rem',
                background: '#FFFFFF',
                color: '#0A2956',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              Get the Student App
            </a>
            <Link
              to="/login"
              style={{
                padding: '0.85rem 2.2rem',
                background: 'transparent',
                color: '#FFFFFF',
                border: '2px solid #FFFFFF',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'background 0.2s, transform 0.2s',
              }}
            >
              Teacher Assistance
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section
        style={{
          background: '#FFFFFF',
          padding: '3rem 2rem',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            color: '#0A2956',
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '2rem',
          }}
        >
          PalmPulse by the Numbers
        </h2>
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap',
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                flex: '1 1 150px',
                minWidth: '140px',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#0A2956',
                  marginBottom: '0.25rem',
                }}
              >
                {stat.value}
              </div>
              <div style={{ color: '#64748B', fontWeight: 500, fontSize: '0.95rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features – responsive grid */}
      <section
        id="features"
        className="section-padding"
        style={{
          background: '#FFFFFF',
          textAlign: 'center',
          padding: '5rem 2rem',
        }}
      >
        <h2
          className="section-title"
          style={{ color: '#0A2956', fontSize: '2.2rem', fontWeight: 700, marginBottom: '3rem' }}
        >
          Why PalmPulse?
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card"
              style={{
                flex: '1 1 250px',
                maxWidth: '300px',
                padding: '2rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ color: '#0A2956', fontWeight: 600, marginBottom: '0.5rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Student App Section */}
      <section
        id="student-app"
        className="section-padding"
        style={{
          background: '#F8FAFC',
          textAlign: 'center',
          padding: '5rem 2rem',
        }}
      >
        <h2
          className="section-title"
          style={{ color: '#0A2956', fontSize: '2.2rem', fontWeight: 700, marginBottom: '1rem' }}
        >
          The Student Mobile App
        </h2>
        <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Available on Android (Kotlin). Enrol in courses, track your badge progress, learn
          signs with video, and chat with our AI assistant – all from your phone.
        </p>
        <p style={{ color: '#0A2956', fontWeight: 600 }}>
          Download coming soon • Built with Kotlin & Jetpack Compose
        </p>
      </section>

      <Footer />
    </div>
  );
}

const stats = [
  { icon: '📚', value: '12', label: 'Courses' },
  { icon: '📖', value: '48', label: 'Lessons' },
  { icon: '🎓', value: '250+', label: 'Students' },
  { icon: '👨‍🏫', value: '18', label: 'Teachers' },
];

const features = [
  { icon: '📚', title: 'Structured Courses', desc: 'Learn from carefully designed lessons, from beginner to advanced levels.' },
  { icon: '🏅', title: 'Earn Badges', desc: 'Silver, Gold, Diamond, Platinum – unlock achievements as you progress.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Ask sign language questions and get instant answers from our Gemini‑powered AI.' },
];