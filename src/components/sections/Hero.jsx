import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Link } from "react-scroll";
import { Download } from "lucide-react";
import ResumePdf from "../../assets/Resume.pdf";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

// Generate stable star positions once
const STARS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() < 0.6 ? 1.5 : Math.random() < 0.9 ? 2.5 : 3.5,
  delay: `${(Math.random() * 6).toFixed(2)}s`,
  duration: `${(3 + Math.random() * 5).toFixed(2)}s`,
}));

const HeroBg = () => {
  const stars = useMemo(() => STARS, []);

  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* ── Existing rotating orbs (kept, refined) ── */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-primary-500/20 blur-3xl opacity-50 dark:opacity-20"
      />
      <motion.div
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-3xl opacity-50 dark:opacity-20"
      />
      <motion.div
        animate={{ y: [0, -50, 0], x: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] left-[20%] w-[800px] h-[800px] rounded-full bg-blue-500/20 blur-3xl opacity-30 dark:opacity-10"
      />

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.045] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(14,165,233,0.7) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.7) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Scan-line sweep ── */}
      <motion.div
        aria-hidden
        animate={{ y: ["-100%", "200%"] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 4,
        }}
        className="absolute left-0 right-0 h-[35%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(14,165,233,0.04) 35%, rgba(139,92,246,0.05) 65%, transparent 100%)",
        }}
      />

      {/* ── Star / particle field ── */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="hero-star"
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        />
      ))}

      {/* ── Radial vignette to keep edges dark ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.08) 100%)",
        }}
      />
    </div>
  );
};

const Hero = () => {
  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <HeroBg />

      <div className="container mx-auto px-6 max-w-5xl z-10 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-primary-500 font-bold mb-4 tracking-wide uppercase"
          >
            Hello, I'm
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight dark:text-white"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary-700 to-gray-900 dark:from-white dark:via-primary-300 dark:to-white">
              Soham Tarabada
            </span>
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="text-2xl md:text-4xl font-bold text-gray-600 dark:text-gray-300 mb-8 h-[60px]"
          >
            <TypeAnimation
              sequence={[
                "MERN Stack Developer",
                2000,
                "Frontend Enthusiast",
                2000,
                "Backend Developer",
                2000,
                "Full-Stack Problem Solver",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12 leading-relaxed"
          >
            Full-Stack Developer specializing in MERN, Next.js & TypeScript —
            bridging clean frontends with robust backends. Architecting
            cloud-native solutions with AWS, Docker & Kubernetes.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="projects"
              smooth={true}
              duration={500}
              className="w-full sm:w-auto"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/40 transition-all w-full relative overflow-hidden group"
              >
                <span className="relative z-10">View Projects</span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 ease-out group-hover:scale-100 group-hover:bg-white/20 z-0" />
              </motion.button>
            </Link>

            <a
              href={ResumePdf}
              download="Soham_Tarabada_Resume.pdf"
              className="w-full sm:w-auto"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 glass text-gray-900 dark:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 w-full border border-gray-200 dark:border-white/10 hover:shadow-xl hover:border-primary-500/50"
              >
                <Download size={20} className="text-primary-500" />
                Download Resume
              </motion.button>
            </a>
          </motion.div>

          {/* Social Links */}
          {/* <motion.div
            variants={itemVariants}
            className="flex justify-center gap-4 mt-4"
          >
            {[
              {
                icon: FaGithub,
                href: "https://github.com/soham-tarabada",
                label: "GitHub",
              },
              {
                icon: FaLinkedin,
                href: "https://www.linkedin.com/in/soham-tarabada-51a50020b",
                label: "LinkedIn",
              },
              {
                icon: FaInstagram,
                href: "https://www.instagram.com/_soham9898/",
                label: "Instagram",
              },
              {
                icon: FaTelegramPlane,
                href: "https://t.me/soham9898",
                label: "Telegram",
              },
              {
                icon: FaWhatsapp,
                href: "https://wa.me/918799535382",
                label: "WhatsApp",
              },
            ].map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full glass border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:border-primary-500/50 transition-colors shadow-sm"
              >
                <social.icon size={20} />
              </motion.a>
            ))}
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
