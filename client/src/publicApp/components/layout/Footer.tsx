import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: 'var(--dark-text)', 
      color: 'var(--white)', 
      padding: '80px 5% 40px',
      borderTop: '4px solid var(--primary-gold)'
    }}>
      <div className="luxury-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-gold)', fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Yazhi</h3>
          <p style={{ opacity: 0.8, lineHeight: 1.6, maxWidth: '300px' }}>
            Turning every celebration into a lifetime memory with our premium event management services.
          </p>
        </div>
        
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary-gold)' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><Link to="/" style={{ color: 'var(--white)', textDecoration: 'none', opacity: 0.8 }}>Home</Link></li>
            <li><Link to="/about" style={{ color: 'var(--white)', textDecoration: 'none', opacity: 0.8 }}>Our Story</Link></li>
            <li><Link to="/services" style={{ color: 'var(--white)', textDecoration: 'none', opacity: 0.8 }}>Services</Link></li>
            <li><Link to="/gallery" style={{ color: 'var(--white)', textDecoration: 'none', opacity: 0.8 }}>Gallery</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary-gold)' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.8 }}>
            <li>Tiruppur, Tamil Nadu, India</li>
            <li>hello@yazhievents.com</li>
            <li>+91 98765 43210</li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary-gold)' }}>Newsletter</h4>
          <p style={{ opacity: 0.8, marginBottom: '1rem' }}>Subscribe for inspiration & updates.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
             <input type="email" placeholder="Your Email" style={{ padding: '12px 16px', borderRadius: '8px', border: 'none', outline: 'none', width: '100%', fontFamily: 'var(--font-body)' }} />
             <button style={{ backgroundColor: 'var(--primary-gold)', color: 'var(--white)', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Subscribe</button>
          </div>
        </div>
      </div>
      
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} Yazhi Event Management. All rights reserved. Designed with luxury in mind.
      </div>
    </footer>
  );
};
