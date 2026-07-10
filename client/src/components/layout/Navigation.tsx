import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

export const Navigation = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Packages', path: '/packages' },
    { name: 'Testimonials', path: '/testimonials' },
  ];

  return (
    <nav className="hidden md:flex space-x-8">
      {navLinks.map((link) => (
        <Link
          key={link.name}
          to={link.path}
          className={clsx(
            'text-base font-medium transition-colors hover:text-primary',
            location.pathname === link.path ? 'text-primary border-b-2 border-primary' : 'text-ink'
          )}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
};
