

import Navbar from '../components/navbar';
import Hero from '../components/hero';
import About from '../components/about';
import Stats from '../components/stats';
import Graphs from '../components/graphs';

export function meta() {
  return [
    { title: "Lums By The Numbers - LUMS Admissions Data & Statistics" },
    { name: "description", content: "Explore verified LUMS admissions data including SAT scores and O Level grades from accepted students. Get insights into admission requirements and predict your chances for MGHSS, SBASSE, SDSB, and SAHSOL." },
    { name: "keywords", content: "LUMS admissions, LUMS SAT scores, LUMS O levels, LUMS statistics, LUMS MGHSS, LUMS SBASSE, LUMS SDSB, LUMS SAHSOL, Pakistan university admissions, LUMS requirements, LUMS acceptance rate" },
    { property: "og:title", content: "Lums By The Numbers - LUMS Admissions Data & Statistics" },
    { property: "og:description", content: "Explore verified LUMS admissions data including SAT scores and O Level grades from accepted students across MGHSS, SBASSE, SDSB, and SAHSOL." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://lumsbythenumbers.vercel.app" },
    { property: "og:image", content: "https://lumsbythenumbers.vercel.app/og.png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Lums By The Numbers - LUMS Admissions Data & Statistics" },
    { name: "twitter:description", content: "Explore verified LUMS admissions data including SAT scores and O Level grades from accepted students." },
    { name: "twitter:image", content: "https://lumsbythenumbers.vercel.app/og.png" },
  ];
}

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <div id="about">
        <About />
      </div>
      <div id="statistics">
        <Stats />
      </div>
      <div id="visualizations">
        <Graphs />
      </div>
    </>
  );
}
