import React from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Stats from "./components/sections/Stats";
import Skills from "./components/sections/Skills";
import Projects from "./components/sections/Projects";
import Experience from "./components/sections/Experience";
import Timeline from "./components/sections/Timeline";
import Contact from "./components/sections/Contact";

function App() {
  return (
    <div className="min-h-screen font-sans selection:bg-primary-500/30">
      <Header />
      <main>
        <Hero />
        <About />
        {/* <Stats /> */}
        <Skills />
        <Projects />
        {/* <Experience /> */}
        <Timeline />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
