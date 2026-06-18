import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />
      <section style={{
        padding: '5rem 2rem',
        maxWidth: '800px',
        margin: '0 auto',
        color: '#0A2956',
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          About PalmPulse
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#334155', marginBottom: '2rem' }}>
          PalmPulse is a sign language learning platform that blends structured courses with AI‑powered assistance.
          Our mission is to make sign language education accessible, engaging, and effective for everyone.
        </p>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#334155', marginBottom: '2rem' }}>
          Founded in Ghana, we’re dedicated to bridging communication gaps and empowering both students and teachers
          with modern technology. The student mobile app (built with Kotlin) and the web‑based teacher/admin dashboard
          work together to create a seamless learning experience.
        </p>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1rem' }}>Our Team</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#334155' }}>
          We’re a small, passionate team of developers, sign language experts, and educators committed to
          transforming how sign languages are taught and learned.
        </p>
      </section>
      <Footer />
    </div>
  );
}