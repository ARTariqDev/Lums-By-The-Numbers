import { useEffect, useRef, useState } from 'react';

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
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [educationSystem, setEducationSystem] = useState('O/A-Levels');
  const [statsData, setStatsData] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error('Error fetching data:', err));
  }, []);

  useEffect(() => {
    if (!data.length) return;
    
    // Filter purely by year, used for combined SAT metric spanning both systems
    const filteredData = selectedYear === 'All' ? data : data.filter(d => d.Year === parseInt(selectedYear));
    const combinedSatScores = filteredData.map(d => d.SAT).filter(n => n).sort((a,b) => a - b);

    // Filter for system-specific grades
    const systemData = filteredData.filter(d => educationSystem === 'O/A-Levels' ? d.O_Levels !== null : (d.Matric !== null || d.FSc !== null));
    const oLevels = systemData.map(d => d.O_Levels).filter(n => n).sort((a,b) => a - b);
    const asLevels = systemData.map(d => d.AS_Levels).filter(n => n).sort((a,b) => a - b);
    const matricData = systemData.map(d => d.Matric).filter(n => n).sort((a,b) => a - b);
    const fscData = systemData.map(d => d.FSc).filter(n => n).sort((a,b) => a - b);
    
    const calculateStats = (arr) => {
      if (!arr.length) return null;
      const count = arr.length;
      const mean = arr.reduce((a,b) => a+b, 0) / count;
      const variance = arr.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / count;
      const std = Math.sqrt(variance);
      const min = arr[0];
      const max = arr[count - 1];
      const getPercentile = (p) => {
        const idx = (count - 1) * p;
        const lower = Math.floor(idx);
        const upper = Math.ceil(idx);
        const weight = idx - lower;
        if (upper >= count) return arr[lower];
        return arr[lower] * (1 - weight) + arr[upper] * weight;
      };
      
      return {
        count, mean, std, min,
        '25%': getPercentile(0.25),
        '50%': getPercentile(0.50),
        '75%': getPercentile(0.75),
        max
      };
    };
    
    setStatsData({
      SAT: calculateStats(combinedSatScores),
      'O Levels': educationSystem === 'O/A-Levels' ? calculateStats(oLevels) : null,
      'AS Levels': educationSystem === 'O/A-Levels' ? calculateStats(asLevels) : null,
      Matric: educationSystem === 'Matric/FSc' ? calculateStats(matricData) : null,
      FSc: educationSystem === 'Matric/FSc' ? calculateStats(fscData) : null,
    });
  }, [data, selectedYear, educationSystem]);

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
            className={`mt-4 space-y-1 text-sm md:text-base text-yellow-300/80 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <p>* Statistics may not be accurate since 2026 decisions are still rolling out.</p>
            <p>* Matric/FSc data for 2025 is not available.</p>
            <p>* SAT statistics are combined (for both O/A Levels and Matric/FSc students).</p>
          </div>
          <div
            className={`w-24 md:w-32 h-1 bg-white opacity-30 mx-auto mt-4 md:mt-6 transition-all duration-1000 delay-300 ${isVisible ? 'scale-x-100' : 'scale-x-0'}`}
          ></div>
        </div>
        
        <div className={`flex flex-row flex-wrap gap-4 items-center justify-center mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex gap-4 items-center bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
            <span className="text-white text-sm uppercase tracking-wider ml-2">System:</span>
            {['O/A-Levels', 'Matric/FSc'].map(system => (
              <button
                key={system}
                onClick={() => setEducationSystem(system)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${educationSystem === system ? 'bg-white text-black font-medium' : 'text-white hover:bg-white/20'}`}
              >
                {system}
              </button>
            ))}
          </div>

          <div className="flex gap-4 items-center bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
            <span className="text-white text-sm uppercase tracking-wider ml-2">Admission Year:</span>
            {['All', '2025', '2026'].map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${selectedYear === year ? 'bg-white text-black font-medium' : 'text-white hover:bg-white/20'}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {statsData && statsData.SAT && (
            <StatCard
              title="SAT Scores"
              stats={statsData.SAT}
              delay={400}
              isVisible={isVisible}
            />
          )}
          {statsData && statsData['O Levels'] && (
            <StatCard
              title="O Levels Points"
              stats={statsData['O Levels']}
              delay={600}
              isVisible={isVisible}
            />
          )}
          {statsData && statsData['AS Levels'] && (
            <StatCard
              title="AS Levels Points"
              stats={statsData['AS Levels']}
              delay={800}
              isVisible={isVisible}
            />
          )}
          {statsData && statsData.Matric && (
            <StatCard
              title="Matric Percentage"
              stats={statsData.Matric}
              delay={600}
              isVisible={isVisible}
            />
          )}
          {statsData && statsData.FSc && (
            <StatCard
              title="FSc Percentage"
              stats={statsData.FSc}
              delay={800}
              isVisible={isVisible}
            />
          )}
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