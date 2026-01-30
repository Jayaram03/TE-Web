import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Logic: Navbar is transparent ONLY on Home page AND when not scrolled
  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Enquiry', path: '/enquiry' },
    { name: 'Contact Us', path: '/contact' },
  ];

  // Dynamic Classes - Increased Z-Index to stay above everything
  const navContainerClasses = `fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isTransparent
    ? 'bg-transparent py-5'
    : 'bg-surface/95 backdrop-blur-md shadow-sm py-3 border-b border-orange-100'
    }`;

  const linkBaseClasses = "font-medium transition-colors duration-300";
  // On transparent background: White text. On solid background: Dark text.
  // Active state: Underline on transparent, Primary color on solid.
  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    if (isTransparent) {
      return `${linkBaseClasses} ${isActive ? 'text-white border-b-2 border-white' : 'text-white/90 hover:text-white'}`;
    } else {
      return `${linkBaseClasses} ${isActive ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary'}`;
    }
  };

  const mobileToggleColor = isTransparent ? 'text-white' : 'text-slate-900';

  // Logo: Apply mix-blend-multiply ONLY when on white background to remove white box from logo if present.
  const logoClasses = `h-24 md:h-32 w-auto object-contain transition-all duration-300 ${!isTransparent ? 'mix-blend-multiply' : ''
    }`;

  return (
    <nav className={navContainerClasses}>
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {/* Logo Image */}
          <img src="/logo.png" alt="Travel Episodes" className={logoClasses} />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={getLinkClasses(link.path)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/enquiry"
            className={`btn ${isTransparent ? 'bg-white text-primary hover:bg-orange-50' : 'btn-primary'}`}
          >
            Plan My Trip
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className={mobileToggleColor} /> : <Menu className={mobileToggleColor} />}
        </button>

        {/* Mobile Menu with AnimatePresence */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-full left-0 right-0 bg-surface border-t border-orange-100 shadow-lg px-6 overflow-hidden md:hidden flex flex-col"
            >
              <div className="py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-lg font-medium ${location.pathname === link.path ? 'text-primary' : 'text-slate-600'
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/enquiry"
                  className="btn btn-primary w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Plan My Trip
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
