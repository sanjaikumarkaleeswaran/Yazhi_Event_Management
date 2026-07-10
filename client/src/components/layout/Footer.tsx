import { Container } from './Container';

export const Footer = () => {
  return (
    <footer className="bg-ink text-background py-12 border-t border-primary/20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-heading text-primary mb-4">Yazhi</h3>
            <p className="text-sm opacity-80">Turning every celebration into a lifetime memory.</p>
          </div>
          <div>
            <h4 className="font-heading text-xl mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="/about">About Us</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/gallery">Gallery</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-xl mb-4 text-primary">Contact</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Chennai, Tamil Nadu</li>
              <li>hello@yazhievents.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center text-sm opacity-60 border-t border-white/10 pt-6">
          &copy; {new Date().getFullYear()} Yazhi Event Management. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};
