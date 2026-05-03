import React, { Suspense, lazy } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";

const About    = lazy(() => import("./components/sections/About"));
const Skills   = lazy(() => import("./components/sections/Skills"));
const Projects = lazy(() => import("./components/sections/Projects"));
const Timeline = lazy(() => import("./components/sections/Timeline"));
const Contact  = lazy(() => import("./components/sections/Contact"));

const SectionSkeleton = () => (
  <div className="py-24 flex justify-center items-center min-h-[300px]">
    <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <div className="min-h-screen font-sans selection:bg-primary-500/30">
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<SectionSkeleton />}>
          <About />
          <Skills />
          <Projects />
          <Timeline />
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
