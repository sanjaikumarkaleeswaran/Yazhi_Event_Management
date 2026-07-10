import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiCamera, FiMusic, FiHeart } from 'react-icons/fi';
import { SEO } from '../../shared/components/SEO';
import { useGallery } from '../../shared/hooks/useGallery';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const services = [
  { title: 'Luxury Weddings', desc: 'Authentic traditions woven into modern elegance for a timeless celebration.', icon: <FiHeart /> },
  { title: 'Milestone Events', desc: 'Birthdays, Anniversaries & Valaikappu crafted with premium care.', icon: <FiStar /> },
  { title: 'Photography', desc: 'Cinematic visual storytelling to capture your unforgettable moments.', icon: <FiCamera /> },
  { title: 'Entertainment', desc: 'World-class artists and traditional performances for your guests.', icon: <FiMusic /> },
];

const Home = () => {
  const { data: galleryResponse } = useGallery();
  
  const defaultImages = [
    { imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80', altText: 'Luxury Tamil Wedding' },
    { imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', altText: 'Event Decor' },
    { imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80', altText: 'Bride Portrait' },
  ];

  const fetchedGallery = galleryResponse?.data?.slice(0, 3) || [];
  const featuredGallery = fetchedGallery.length > 0 ? fetchedGallery : defaultImages;

  return (
    <div className="home-page">
      <SEO 
        title="Premium Tamil Wedding & Event Management | Yazhi Events"
        description="Luxury Tamil cultural event management tailored perfectly for you. We handle the details, you enjoy the moment."
      />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="bg-decor-1"></div>
        <div className="bg-decor-2"></div>
        
        <div className="hero-grid luxury-container">
          <motion.div 
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeIn} className="hero-title">
              Turning Every Celebration Into A <br /> <span>Timeless Memory.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="hero-subtitle">
              Premium Tamil Wedding & Event Management for unforgettable celebrations.
            </motion.p>
            
            <motion.div variants={fadeIn} className="hero-actions">
              <Link to="/contact" className="btn-primary">
                Book Consultation <FiArrowRight style={{ marginLeft: '10px' }} />
              </Link>
              <Link to="/gallery" className="btn-secondary">
                Explore Gallery
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="hero-image-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.8, 0.25, 1] }}
          >
            {featuredGallery.length > 0 ? (
              <img 
                src={featuredGallery[0]?.imageUrl} 
                alt={featuredGallery[0]?.altText || "Luxury Tamil Wedding"} 
                className="hero-image"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--primary-gold)', opacity: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--dark-text)', fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Image will appear here</span>
              </div>
            )}
            
            <motion.div 
              className="floating-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <div className="floating-card-icon">
                <FiStar />
              </div>
              <div className="floating-card-text">
                <h4>500+ Luxury Events</h4>
                <p>Perfectly executed</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-spacing" style={{ backgroundColor: 'var(--white)' }}>
        <div className="luxury-container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: 'var(--deep-maroon)', marginBottom: '1rem' }}>
              Our Services
            </h2>
            <p style={{ color: 'var(--dark-text)', opacity: 0.7, maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              We specialize in creating bespoke, luxury experiences that blend rich Tamil heritage with modern elegance.
            </p>
          </motion.div>

          <motion.div 
            className="services-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}
          >
            {services.map((service, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeIn}
                className="service-card"
                style={{
                  background: 'var(--cream-bg)',
                  padding: '3rem 2rem',
                  borderRadius: 'var(--border-radius-card)',
                  transition: 'var(--transition-smooth)',
                  cursor: 'pointer',
                  border: '1px solid rgba(200, 155, 60, 0.1)',
                }}
                whileHover={{ y: -10, boxShadow: 'var(--shadow-luxury)' }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-gold)',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  marginBottom: '2rem'
                }}>
                  {service.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{service.title}</h3>
                <p style={{ color: '#55443a', lineHeight: 1.6 }}>{service.desc}</p>
                
                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', color: 'var(--primary-gold)', fontWeight: 600 }}>
                  Learn More <FiArrowRight style={{ marginLeft: '8px' }} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Gallery Highlight */}
      <section className="section-spacing">
         <div className="luxury-container">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}
            >
              <div>
                <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: 'var(--deep-maroon)' }}>
                  Visual Masterpieces
                </h2>
              </div>
              <Link to="/gallery" className="btn-secondary" style={{ display: 'none' }}>
                View Full Gallery
              </Link>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
               <motion.div
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true }}
                 variants={fadeIn}
                 style={{ height: '600px', borderRadius: 'var(--border-radius-card)', overflow: 'hidden', background: 'var(--cream-bg)' }}
               >
                  {featuredGallery.length > 1 ? (
                    <img src={featuredGallery[1]?.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Decor" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', opacity: 0.1, background: 'var(--primary-gold)' }} />
                  )}
               </motion.div>
               <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '2rem' }}>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    style={{ borderRadius: 'var(--border-radius-card)', overflow: 'hidden', background: 'var(--cream-bg)' }}
                  >
                    {featuredGallery.length > 2 ? (
                      <img src={featuredGallery[2]?.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Event" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', opacity: 0.1, background: 'var(--primary-gold)' }} />
                    )}
                  </motion.div>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    style={{ borderRadius: 'var(--border-radius-card)', overflow: 'hidden', background: 'var(--primary-gold)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--white)', padding: '2rem', textAlign: 'center' }}
                  >
                    <h3 style={{ color: 'var(--white)', fontSize: '2rem', marginBottom: '1rem' }}>See More</h3>
                    <p style={{ marginBottom: '2rem' }}>Explore our extensive portfolio of luxury events.</p>
                    <Link to="/gallery" className="btn-secondary" style={{ borderColor: 'var(--white)', color: 'var(--white)' }}>
                      Open Gallery
                    </Link>
                  </motion.div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
