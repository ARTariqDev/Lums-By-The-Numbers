import { useEffect, useRef, useState } from 'react';

const statsData = {
  SAT: {
    count: 53,
    mean: 1405.47,
    std: 83.33,
    min: 1200,
    '25%': 1350,
    '50%': 1410,
    '75%': 1470,
    max: 1580,
  },
  'O Levels': {
    count: 53,
    mean: 74.53,
    std: 18.52,
    min: 41,
    '25%': 62,
    '50%': 71,
    '75%': 84,
    max: 134,
  },
};

const statLabels = {
  count: 'Sample Size',
  mean: 'Average',
  std: 'Std. Deviation',
  min: 'Minimum',
  '25%': '25th Percentile',
  '50%': 'Median',
  '75%': '75th Percentile',
  max: 'Maximum',
};

function CountUpNumber({ end, duration = 2000, decimals = 0, isVisible }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      countRef.current = 0;
      startTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    startTimeRef.current = null;

    const animate = (currentTime) => {
      if (!startTimeRef.current) startTimeRef.current = currentTime;
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = easeOutQuart * end;
      
      countRef.current = current;
      setCount(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [end, duration, isVisible]);

  return (
    <span className="font-light tabular-nums">
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}
    </span>
  );
}

function StatCard({ title, stats, delay, isVisible }) {
  return (
    <div
      className={`stat-card border border-white border-opacity-10 rounded-xl md:rounded-2xl p-4 md:p-8 backdrop-blur-sm transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-extralight text-white mb-4 md:mb-8 tracking-wide text-center">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {Object.entries(stats).map(([key, value], index) => (
          <div
            key={key}
            className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
            style={{ transitionDelay: `${delay + 200 + index * 100}ms` }}
          >
            <div className="text-white text-[10px] md:text-sm uppercase tracking-widest opacity-50 mb-1 md:mb-2">
              {statLabels[key]}
            </div>
            <div className="text-white text-xl md:text-3xl lg:text-4xl">
              <CountUpNumber
                end={value}
                decimals={key === 'mean' || key === 'std' ? 2 : 0}
                isVisible={isVisible}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
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
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 md:mb-16 text-center">
          <h2
            className={`text-4xl md:text-6xl lg:text-7xl font-light text-white mb-3 md:mb-4 tracking-wide transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            The Numbers
          </h2>
          <p
            className={`text-white text-base md:text-lg lg:text-xl font-light opacity-70 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Statistical breakdown of admitted students
          </p>
          <div
            className={`w-24 md:w-32 h-1 bg-white opacity-30 mx-auto mt-4 md:mt-6 transition-all duration-1000 delay-300 ${isVisible ? 'scale-x-100' : 'scale-x-0'}`}
          ></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <StatCard
            title="SAT Scores"
            stats={statsData.SAT}
            delay={400}
            isVisible={isVisible}
          />
          <StatCard
            title="O Levels Points"
            stats={statsData['O Levels']}
            delay={600}
            isVisible={isVisible}
          />
        </div>

        <div
          className={`flex items-center justify-center gap-4 mt-8 md:mt-16 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-white opacity-20"></div>
          <div className="flex gap-2">
            <div className="w-1 h-1 bg-white rounded-full opacity-30"></div>
            <div className="w-1 h-1 bg-white rounded-full opacity-30"></div>
            <div className="w-1 h-1 bg-white rounded-full opacity-30"></div>
          </div>
          <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-white opacity-20"></div>
        </div>
      </div>
    </section>
  );
}