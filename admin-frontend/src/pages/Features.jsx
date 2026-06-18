import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function Features() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />
      <section style={{
        padding: '5rem 2rem',
        maxWidth: '1100px',
        margin: '0 auto',
        color: '#0A2956',
      }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 700, textAlign: 'center', marginBottom: '1rem' }}>
          Powerful Features for Sign Language Learning
        </h1>
        <p style={{ textAlign: 'center', color: '#475569', fontSize: '1.1rem', marginBottom: '3rem' }}>
          Everything you need to learn, teach, and master sign language – all in one place.
        </p>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ color: '#475569', lineHeight: '1.6' }}>{f.description}</p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link to="/login" style={{
            padding: '0.9rem 2.5rem',
            background: '#0A2956',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'inline-block',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.target.style.background = '#135290'}
            onMouseLeave={e => e.target.style.background = '#0A2956'}
          >
            Get Started Now
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}

const features = [
  {
    icon: '📚',
    title: 'Structured Courses',
    description: 'Progressive lessons from beginner to advanced. Each course contains multiple lessons with videos, images, and text. Earn badges as you complete milestones.',
  },
  {
    icon: '🤟',
    title: 'Interactive Sign Videos',
    description: 'Watch high‑quality sign language videos for every word. Slow down, loop, and practice with real demonstrations by experienced signers.',
  },
  {
    icon: '🏅',
    title: 'Badge & Progress Tracking',
    description: 'Earn Silver, Gold, Diamond, and Platinum badges as you complete your course. See your progress at a glance and stay motivated.',
  },
  {
    icon: '🤖',
    title: 'AI Sign Language Assistant',
    description: 'Powered by Google Gemini, our AI answers your sign language questions instantly. Ask anything from “How do I sign ‘thank you’?” to grammar rules.',
  },
  {
    icon: '👨‍🏫',
    title: 'Teacher Dashboard',
    description: 'Teachers can create and manage their own lessons, signs, and courses. Track student progress and provide guidance.',
  },
  {
    icon: '📱',
    title: 'Student Mobile App (Kotlin)',
    description: 'Dedicated Android app for students. Enrol in courses, view lessons, chat with AI, and track badges – all from your phone.',
  },
  {
    icon: '🔍',
    title: 'Smart Search & Dictionary',
    description: 'Browse and search a growing library of signs. Each sign includes a video, image, and detailed description.',
  },
  {
    icon: '💬',
    title: 'Lesson Comments & Community',
    description: 'Discuss lessons with teachers and other learners. Share tips, ask questions, and celebrate progress together.',
  },
  {
    icon: '📊',
    title: 'Admin Audit Logs',
    description: 'Every CRUD operation is logged. Admins can review user activity, course changes, and more for security and transparency.',
  },
];