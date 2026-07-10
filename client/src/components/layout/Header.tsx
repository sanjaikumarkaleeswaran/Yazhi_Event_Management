import { Link } from 'react-router-dom';
import { Container } from './Container';
import { Navigation } from './Navigation';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-primary/10">
      <Container>
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-heading font-bold text-primary">Yazhi</span>
          </Link>

          <Navigation />

          <div className="hidden md:block">
            <Link
              to="/contact"
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all font-medium"
            >
              Book Now
            </Link>
          </div>

          <button
            className="md:hidden text-ink p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </Container>
      
      {/* Basic mobile menu rendering placeholder */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-primary/10">
          <div className="px-4 py-4 space-y-4 flex flex-col">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/services" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
            <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link>
            <Link to="/packages" onClick={() => setIsMobileMenuOpen(false)}>Packages</Link>
            <Link to="/testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</Link>
            <Link to="/contact" className="text-primary font-bold" onClick={() => setIsMobileMenuOpen(false)}>Book Now</Link>
          </div>
        </div>
      )}
    </header>
  );
};
