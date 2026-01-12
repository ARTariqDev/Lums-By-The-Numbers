import { useEffect, useState, useRef } from 'react';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const titleParts = ["Lums By The", "Numbers"];
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative w-full h-screen flex items-center justify-center">
      {/* Hero Content */}
      <div className="text-center p-8 max-w-6xl mx-auto">
        <div className="mb-6 text-white text-sm tracking-[0.3em] uppercase opacity-60">Welcome to</div>
        
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight leading-[0.95] m-0 tracking-wide mb-8">
          {titleParts.map((part, partIndex) => {
            const letters = part.split('');
            const baseIndex = partIndex === 0 ? 0 : titleParts[0].length + 1;
            return (
              <span key={partIndex}>
                {letters.map((letter, index) => (
                  <span
                    key={`${partIndex}-${index}`}
                    className={`letter text-white ${isVisible ? 'visible' : ''}`}
                    style={{
                      animationDelay: `${(baseIndex + index) * 0.05}s`
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </span>
                ))}
                {partIndex < titleParts.length - 1 && <br />}
              </span>
            );
          })}
        </h1>
        
        <p className="subtitle text-white text-lg md:text-xl lg:text-2xl font-light opacity-70 max-w-3xl mx-auto leading-relaxed">
          Explore data-driven insights and statistics about Lahore University of Management Sciences
        </p>
      </div>


      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 scroll-indicator">
        <div className="flex flex-col items-center gap-2">
          <div className="text-white text-xs uppercase tracking-widest opacity-50">Scroll</div>
          <div className="w-6 h-10 border-2 border-white rounded-full opacity-50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
