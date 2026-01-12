import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeSection, setActiveSection] = useState('/');
  const activeTextRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id) {
            setActiveSection(`#${id}`);
          } else {
            setActiveSection('/');
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = ['about', 'statistics', 'visualizations'];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    const hero = document.querySelector('main > div:first-child');
    if (hero) {
      observer.observe(hero);
    }

    return () => observer.disconnect();
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '#about' },
    { name: 'Statistics', path: '#statistics' },
    { name: 'Visualizations', path: '#visualizations' },
    { name: 'Submit Data', path: '/submit' },
  ];

  const isActive = (path) => {
    if (path === '/') return activeSection === '/' || location.pathname === '/';
    return activeSection === path || location.hash === path;
  };

  const handleNavClick = (path) => {
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getActiveSection = () => {
    const activeItem = navItems.find(item => isActive(item.path));
    return activeItem ? activeItem.name : 'Home';
  };

  const handleMenuToggle = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 200);
    } else {
      setIsOpen(true);
    }
  };

  const handleLinkClick = (path) => {
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const handleMobileMenuClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur-md border-b md:border-b-0 border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center md:justify-center h-16 relative">
            <div ref={activeTextRef} className="md:hidden text-white text-lg font-light tracking-wide">
              Lums By The Numbers
            </div>

            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                item.path.startsWith('#') ? (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.path);
                    }}
                    className="text-sm font-light tracking-wide transition-all text-white text-opacity-70 hover:text-opacity-100 hover:border-b-2 hover:border-white hover:border-opacity-30 pb-1"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-sm font-light tracking-wide transition-all text-white text-opacity-70 hover:text-opacity-100 hover:border-b-2 hover:border-white hover:border-opacity-30 pb-1"
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            <button
              onClick={handleMenuToggle}
              className="md:hidden absolute right-0 text-white p-2 hover:bg-white hover:bg-opacity-10 rounded transition-all"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className={`md:hidden fixed left-0 right-0 top-16 z-50 border-b-2 border-white border-opacity-10 ${
            isClosing ? 'animate-slide-up' : 'animate-slide-down'
          }`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navItems.map((item, index) => (
              item.path.startsWith('#') ? (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.path);
                  }}
                  className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center w-full hover:bg-white hover:bg-opacity-10 hover:translate-x-2 ${
                    isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
                  }`}
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    animationDelay: isClosing
                      ? `${(navItems.length - index - 1) * 30}ms`
                      : `${index * 50}ms`
                  }}
                >
                  <span className="text-base">{item.name}</span>
                </a>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleMobileMenuClose}
                  className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center w-full hover:bg-white hover:bg-opacity-10 hover:translate-x-2 ${
                    isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
                  }`}
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    animationDelay: isClosing
                      ? `${(navItems.length - index - 1) * 30}ms`
                      : `${index * 50}ms`
                  }}
                >
                  <span className="text-base">{item.name}</span>
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </>
  );
}
