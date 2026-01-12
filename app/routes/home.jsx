

import Navbar from '../components/navbar';
import Hero from '../components/hero';
import About from '../components/about';
import Stats from '../components/stats';
import Graphs from '../components/graphs';

export function meta() {
  return [
    { title: "LumsByTheNumbers" },
    { name: "description", content: "Welcome to React Router!" },
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
