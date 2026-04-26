import React from "react";
import { motion } from "framer-motion";
import SectionHeading from "../ui/SectionHeading";
import { Code, Server, Database, Blocks } from "lucide-react";

const AboutBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Subtle hex/circle dot grid */}
    <div
      className="absolute inset-0 opacity-[0.28] dark:opacity-[0.12]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #60a5fa 1px, transparent 1px)",
        backgroundSize: "38px 38px",
      }}
    />

    {/* Aurora orb — sky blue */}
    <motion.div
      animate={{ y: [0, -50, 0], x: [0, 35, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-[110px] opacity-30 dark:opacity-15"
      style={{ background: "radial-gradient(circle, #38bdf8, #818cf8)" }}
    />

    {/* Aurora orb — emerald */}
    <motion.div
      animate={{ y: [0, 45, 0], x: [0, -25, 0], scale: [1, 1.12, 1] }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 5,
      }}
      className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-25 dark:opacity-12"
      style={{ background: "radial-gradient(circle, #34d399, #06b6d4)" }}
    />

    {/* Aurora orb — purple centre accent */}
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{
        duration: 14,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[130px] opacity-15 dark:opacity-8"
      style={{ background: "radial-gradient(ellipse, #a78bfa, transparent)" }}
    />

    {/* Top-right corner glow */}
    <div
      className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 dark:opacity-10"
      style={{ background: "radial-gradient(circle, #93c5fd, transparent)" }}
    />
  </div>
);

const cards = [
  {
    icon: <Code size={32} />,
    title: "Frontend",
    desc: "React, Tailwind, Smooth UI",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: <Server size={32} />,
    title: "Backend",
    desc: "Node.js, Express, APIs",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: <Database size={32} />,
    title: "Database",
    desc: "MongoDB, Optimization",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: <Blocks size={32} />,
    title: "Architecture",
    desc: "Scalable MERN Solutions",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

const About = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <AboutBg />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <SectionHeading title="About Me" subtitle="Discover" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
            className="space-y-8 text-lg text-gray-600 dark:text-gray-400"
          >
            <p className="leading-relaxed">
              I'm a Full-Stack Developer specializing in the{" "}
              <strong className="text-gray-900 dark:text-white border-b-2 border-primary-500/30">
                MERN stack, Next.js, and TypeScript
              </strong>
              . I bridge the gap between clean frontend interfaces and robust
              Node.js backends, crafting user-centric applications that are both
              performant and maintainable.
            </p>
            <p className="leading-relaxed">
              With expertise in{" "}
              <strong className="text-gray-900 dark:text-white border-b-2 border-primary-500/30">
                AWS (VPC, EC2, S3), Docker, and Kubernetes
              </strong>
              , I architect scalable, cloud-native solutions. A proactive
              troubleshooter and collaborator, I'm dedicated to streamlining
              deployment workflows and delivering high-performance applications.
            </p>
            <div className="flex gap-8 pt-6 border-t border-gray-200 dark:border-white/10">
              <motion.div
                whileHover={{ y: -5, scale: 1.05 }}
                className="cursor-default"
              >
                <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-primary-600">
                  20+
                </span>
                <span className="text-sm font-semibold mt-1 block">
                  Issues Resolved
                </span>
              </motion.div>
              <div className="w-px bg-gray-200 dark:bg-white/10" />
              <motion.div
                whileHover={{ y: -5, scale: 1.05 }}
                className="cursor-default"
              >
                <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600">
                  4+
                </span>
                <span className="text-sm font-semibold mt-1 block">
                  Full-Stack Projects
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Featured Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {cards.map((card, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  rotate: i % 2 === 0 ? -2 : 2,
                }}
                className="glass p-8 rounded-3xl flex flex-col items-start gap-5 hover:shadow-2xl hover:shadow-primary-500/10 transition-all cursor-pointer group bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5"
              >
                <div
                  className={`p-4 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                >
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
