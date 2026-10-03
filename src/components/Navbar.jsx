import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Compass, Plane, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, useScroll } from 'framer-motion';

const navLinks = [
  { name: 'Home', path: '/', note: 'Where your next chapter begins' },
  { name: 'Destinations', path: '/destinations', note: 'Find your somewhere' },
  { name: 'Enquiry', path: '/enquiry', note: 'Dream it. We’ll plan it.' },
  { name: 'Contact Us', path: '/contact', note: 'A real crew, a quick hello' },
];

const Navbar = () => {
  const [openPath, setOpenPath] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const isOpen = openPath === location.key;
  const closeMenu = () => setOpenPath(null);
  const isTransparent = location.pathname === '/' && !scrolled && !isOpen;
  const active = path => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  const transition = { duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const header = navRef.current;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--site-header-height', `${Math.ceil(header.getBoundingClientRect().bottom)}px`);
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--site-header-height');
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => menuRef.current?.querySelector('button, a')?.focus());
    const handleKey = event => {
      if (event.key === 'Escape') setOpenPath(null);
      if (event.key !== 'Tab') return;
      const elements = [...(menuRef.current?.querySelectorAll('button, a[href]') || [])];
      if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === elements.at(-1)) { event.preventDefault(); elements[0]?.focus(); }
    };
    const desktop = window.matchMedia('(min-width: 768px)');
    const onDesktop = () => { if (desktop.matches) setOpenPath(null); };
    document.addEventListener('keydown', handleKey);
    desktop.addEventListener('change', onDesktop);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      desktop.removeEventListener('change', onDesktop);
      previousFocus?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <header ref={navRef} className="site-header fixed inset-x-0 top-0 z-[100] px-3 md:px-6 pt-2 pb-2">
        <div className={`site-nav-shell mx-auto max-w-7xl rounded-2xl md:rounded-full border transition-colors duration-300 ${isTransparent ? 'bg-slate-900/65 border-white/15 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-lg shadow-slate-900/5'}`}>
          <nav aria-label="Main navigation" className="flex items-center justify-between h-full px-3 md:px-5 gap-3">
            <Link to="/" aria-label="Travel Episodes home" className="shrink-0">
              <img src="/logo-header.png" alt="Travel Episodes" width="512" height="176" className="w-36 sm:w-40 lg:w-48 h-auto max-h-16 object-contain" />
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active(link.path) ? 'page' : undefined}
                  className={`relative px-3 lg:px-4 py-3 rounded-full text-sm font-semibold transition-colors ${active(link.path) ? 'text-primary-dark' : isTransparent ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {active(link.path) && <motion.span layoutId="nav-active-pill" transition={transition} className="absolute inset-0 rounded-full bg-orange-100" />}
                  <span className="relative">{link.name}</span>
                </Link>
              ))}
            </div>
            <Link to="/enquiry" className="hidden md:inline-flex btn btn-primary rounded-full gap-2 text-sm px-4">
              Let’s take off <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              onClick={() => setOpenPath(isOpen ? null : location.key)}
              className="md:hidden flex min-h-11 items-center gap-3 rounded-full px-4 border border-current/15 text-xs font-bold"
            >
              <span>{isOpen ? 'Close' : 'Explore'}</span>
              <span className="relative w-5 h-4" aria-hidden="true">
                <motion.span className="absolute top-1 left-0 h-px w-5 bg-current" animate={{ y: isOpen ? 3 : 0, rotate: isOpen ? 45 : 0 }} transition={transition} />
                <motion.span className="absolute bottom-1 left-0 h-px w-5 bg-current" animate={{ y: isOpen ? -3 : 0, rotate: isOpen ? -45 : 0 }} transition={transition} />
              </span>
            </button>
          </nav>
          {!reducedMotion && (
            <div className="absolute bottom-0 inset-x-8 h-px overflow-hidden" aria-hidden="true">
              <motion.div className="h-full bg-primary origin-left" style={{ scaleX: scrollYProgress }} />
            </div>
          )}
        </div>
      </header>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            initial={reducedMotion ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0 round 0 0 48px 48px)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0 round 0px)' }}
            exit={reducedMotion ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0 round 0 0 48px 48px)' }}
            transition={transition}
            className="fixed inset-0 z-[110] md:hidden bg-[#f5f1e9] overflow-y-auto"
          >
            <div className="min-h-svh flex flex-col px-6 pt-6 pb-8 relative overflow-hidden">
              <Compass className="absolute -right-12 bottom-24 w-64 h-64 text-orange-200/40 pointer-events-none" aria-hidden="true" />
              <div className="relative flex items-center justify-between mb-10">
                <p id="mobile-menu-title" className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Your next episode
                </p>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-full h-11 w-11 bg-white border border-slate-200"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav aria-label="Mobile navigation" className="relative mb-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={reducedMotion ? false : { y: 48, opacity: 0, rotate: 3 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ ...transition, delay: reducedMotion ? 0 : 0.08 + index * 0.07 }}
                  >
                    <Link
                      to={link.path}
                      onClick={closeMenu}
                      aria-current={active(link.path) ? 'page' : undefined}
                      className="block border-b border-slate-300/60 py-5"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-primary font-bold">0{index + 1}</span>
                        <span className={`flex-1 text-[clamp(32px,9vw,46px)] tracking-tight font-black leading-none ${active(link.path) ? 'text-primary' : 'text-slate-900'}`}>
                          {link.name}
                        </span>
                        <ArrowUpRight className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 ml-8 mt-3">{link.note}</p>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="relative mt-auto">
                <Link to="/enquiry" onClick={closeMenu} className="btn btn-primary w-full gap-3 py-4 rounded-2xl">
                  Make it your kind of trip <Plane className="h-4 w-4" />
                </Link>
                <p className="text-center text-[10px] uppercase tracking-widest text-slate-500 mt-5">
                  From Chennai. To everywhere.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
