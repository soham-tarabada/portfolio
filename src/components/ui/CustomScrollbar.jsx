import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

const CustomScrollbar = () => {
  const [windowHeight, setWindowHeight] = useState(0);
  const [docHeight, setDocHeight] = useState(0);

  const { scrollYProgress } = useScroll();
  const [isScrolling, setIsScrolling] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [clickEffect, setClickEffect] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setDocHeight(
        Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight,
        ),
      );
    };

    // Initial calculation with a slight delay to ensure DOM is ready
    setTimeout(handleResize, 100);

    const observer = new MutationObserver(handleResize);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let timeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolling(false), 800);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setIsInteracting(window.innerWidth - e.clientX < 40);
    };

    const handleMouseDown = (e) => {
      if (window.innerWidth - e.clientX < 40) {
        setIsInteracting(true);
        setClickEffect(e.clientY);
        setTimeout(() => setClickEffect(null), 600);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const viewportRatio = windowHeight / docHeight;
  const showScrollbar = viewportRatio > 0 && viewportRatio < 1;

  // Calculate the physical size of the visual scrollbar thumb
  const thumbHeight = Math.max(viewportRatio * windowHeight, 60);

  // Map scroll progress precisely to window translation
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, windowHeight - thumbHeight],
  );

  const isActive = isScrolling || isInteracting;

  return (
    <div className="fixed top-0 right-0 w-4 h-full z-[9999] pointer-events-none overflow-visible">
      {/* Visual background track - fades in when active */}
      <motion.div
        animate={{ opacity: isActive ? 1 : 0 }}
        className="absolute right-0 top-0 w-3 h-full bg-white/10 dark:bg-black/20 backdrop-blur-sm border-l border-white/20 transition-opacity duration-500"
      />

      {showScrollbar && (
        <>
          {/* Main Visual Thumb */}
          <motion.div
            style={{ height: thumbHeight, y }}
            animate={{
              width: isInteracting ? "20px" : isActive ? "14px" : "6px",
              x: isInteracting ? -6 : isActive ? -4 : -2,
              filter: isInteracting
                ? "brightness(1.5) drop-shadow(0 0 20px rgba(14,165,233,1))"
                : isScrolling
                  ? "brightness(1.3) drop-shadow(0 0 10px rgba(168,85,247,0.8))"
                  : "brightness(0.6) drop-shadow(0 0 0px rgba(0,0,0,0))",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 top-0 rounded-full bg-gradient-to-b from-primary-400 via-purple-500 to-pink-500"
          >
            {/* Inner glowing pulse while scrolling */}
            <AnimatePresence>
              {isScrolling && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-x-1 inset-y-4 bg-white rounded-full blur-[2px]"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Click Ripple Shockwave Effect */}
          <AnimatePresence>
            {clickEffect && (
              <motion.div
                initial={{ top: clickEffect, scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute right-2 w-8 h-8 -mt-4 rounded-full border-2 border-primary-400 bg-primary-400/30 z-[10000]"
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default CustomScrollbar;
