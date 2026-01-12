import { useEffect, useRef, useState } from 'react';

export default function About() {
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
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <h2 className={`text-5xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-wide transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            About This Project
          </h2>
          <div className={`w-32 h-1 bg-white opacity-30 divider-line transition-all duration-1000 delay-200 ${isVisible ? 'scale-x-100' : 'scale-x-0 origin-left'}`}></div>
        </div>

        <div className="space-y-8">
          <div className={`space-y-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-white text-lg md:text-xl leading-relaxed font-light opacity-90">
              <span className="text-2xl md:text-3xl font-extralight block mb-4 leading-tight">
                LUMS By The Numbers is a website that compiles verified admissions data for the Lahore University of Management Sciences (LUMS), one of Pakistan's most prestigious universities.
              </span>
            </p>
            
            <p className="text-white text-lg md:text-xl leading-relaxed font-light opacity-80">
              By gathering information from Reddit threads, WhatsApp groups, and other student communities, the site aims to provide a more transparent view of the admissions process. It showcases real SAT scores and O level grades shared by accepted students, helping applicants gauge where they stand.
            </p>
            
            <p className="text-white text-lg md:text-xl leading-relaxed font-light opacity-80">
              Whether you're applying soon or just exploring your options, this resource offers valuable insights to make your application more informed and your expectations more realistic.
            </p>
          </div>

          <div className={`flex items-center gap-4 my-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
            <div className="w-2 h-2 bg-white rounded-full opacity-30"></div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
          </div>

          <div className={`border border-white border-opacity-10 rounded-2xl p-8 backdrop-blur-sm transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-xl font-light mb-3 tracking-wide">Important Note</h3>
                <p className="text-white text-base md:text-lg leading-relaxed font-light opacity-70">
                  Data is calculated using O levels "points" to enable better visualisation. O level "points" are calculated based on A's and A*'s. A grades = 7 points, A* = 10 points. The total sample size for this data set is 53 and is based on last years admissions cycle, the personal statement, level and quality of extracurriculars, awards and honours wasn't accounted for either. As a result, please take this data with a grain of salt (especially since it doesn't paint a full picture of each applicant's profiles).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}