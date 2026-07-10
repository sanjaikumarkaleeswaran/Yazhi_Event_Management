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
      {navLinks.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.name}
            to={link.path}
            className={clsx(
              'text-base font-medium transition-colors relative group py-2',
              isActive ? 'text-primary' : 'text-ink hover:text-primary'
            )}
          >
            {link.name}
            <span
              className={clsx(
                'absolute bottom-0 left-0 w-full h-[2px] bg-primary transition-transform duration-300 origin-left',
                isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              )}
            ></span>
          </Link>
        );
      })}
    </nav>
  );
};
