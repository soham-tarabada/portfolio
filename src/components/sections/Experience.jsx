import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import { useRef } from "react";

const experiences = [
  {
    type: "work",
    title: "JR. Mern Stack Developer",
    org: "Webbrains Technologies Pvt. Ltd.",
    date: "05/2025 – Present",
    location: "Vadodara",
    desc: "Built scalable and responsive web applications using technical skills gained during internship. Consistently met project deadlines through effective time management in fast-paced environments. Acquired practical DevOps knowledge and successfully deployed frontend and backend applications.",
  },
  {
    type: "work",
    title: "Intern",
    org: "Webbrains Technology Pvt. Ltd.",
    date: "01/2025 – 04/2025",
    location: "Vadodara",
    desc: "Learned to build RESTful APIs for smooth frontend–backend communication. Worked with 3 interns to fix 20+ issues, debug code, and improve application functionality.",
  },
  {
    type: "edu",
    title: "B.E. - Computer Engineering",
    org: "Government Engineering College",
    date: "08/2021 – 05/2025",
    location: "Gandhinagar",
    desc: "CGPA: 7.87. Built a strong foundation in data structures, algorithms, and full-stack software development methodologies.",
  },
  {
    type: "edu",
    title: "HSC - Science Stream",
    org: "Parth School of Sci. and Comp.",
    date: "03/2020 – 05/2021",
    location: "Vadodara",
    desc: "Secured 89.69%",
  },
  {
    type: "edu",
    title: "Secondary School Certificate",
    org: "Alembic Vidyalaya",
    date: "04/2018 – 03/2019",
    location: "Vadodara",
    desc: "Secured 92.5%",
  },
];

const TimelineItem = ({ item, index }) => {
  const isWork = item.type === "work";
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? 50 : -50, scale: 0.9 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: index * 0.15,
      }}
      className="relative pl-8 md:pl-0"
    >
      <div className="md:hidden absolute left-0 top-1 w-px h-full bg-gray-200 dark:bg-gray-700" />
      <div className="md:hidden absolute left-[-8px] top-2 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-dark-bg" />

      <div
        className={`md:flex items-center justify-between w-full ${isEven ? "md:flex-row-reverse" : ""}`}
      >
        <div className="hidden md:block w-5/12" />
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 200,
            delay: index * 0.15 + 0.3,
          }}
          className="z-20 hidden md:flex items-center shadow-lg shadow-primary-500/20 justify-center w-12 h-12 bg-primary-500 rounded-full text-white"
        >
          {isWork ? <Briefcase size={20} /> : <GraduationCap size={20} />}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          className="glass p-8 rounded-3xl md:w-5/12 mb-8 md:mb-0 w-full hover:border-primary-500/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-4 py-1.5 bg-primary-500/10 text-primary-500 rounded-full border border-primary-500/20">
              {item.date}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {item.location}
            </span>
          </div>
          <h3 className="text-xl font-bold dark:text-white mt-2 group-hover:text-primary-500 transition-colors">
            {item.title}
          </h3>
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
            {item.org}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            {item.desc}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ─── Decorative Background ─── */
const ExperienceBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Dot-grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />

    {/* Floating orb — violet */}
    <motion.div
      animate={{ y: [0, -40, 0], x: [0, 25, 0], scale: [1, 1.12, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[96px] opacity-30 dark:opacity-20"
      style={{ background: "radial-gradient(circle, #7c3aed, #4f46e5)" }}
    />

    {/* Floating orb — amber */}
    <motion.div
      animate={{ y: [0, 50, 0], x: [0, -30, 0], scale: [1, 1.08, 1] }}
      transition={{
        duration: 22,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 3,
      }}
      className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 dark:opacity-15"
      style={{ background: "radial-gradient(circle, #f59e0b, #d97706)" }}
    />

    {/* Floating orb — teal */}
    <motion.div
      animate={{ y: [0, 35, 0], x: [0, 20, 0], scale: [1, 1.15, 1] }}
      transition={{
        duration: 26,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 6,
      }}
      className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] rounded-full blur-[100px] opacity-20 dark:opacity-10"
      style={{ background: "radial-gradient(circle, #0d9488, #0891b2)" }}
    />

    {/* Diagonal streak 1 */}
    <div
      className="absolute"
      style={{
        top: "10%",
        left: "-5%",
        width: "120%",
        height: "1px",
        transform: "rotate(-8deg)",
        background:
          "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.18) 40%, rgba(139,92,246,0.18) 60%, transparent 100%)",
      }}
    />
    {/* Diagonal streak 2 */}
    <div
      className="absolute"
      style={{
        top: "55%",
        left: "-5%",
        width: "120%",
        height: "1px",
        transform: "rotate(-8deg)",
        background:
          "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.14) 35%, rgba(245,158,11,0.14) 65%, transparent 100%)",
      }}
    />
    {/* Diagonal streak 3 */}
    <div
      className="absolute"
      style={{
        top: "82%",
        left: "-5%",
        width: "120%",
        height: "1px",
        transform: "rotate(-8deg)",
        background:
          "linear-gradient(90deg, transparent 0%, rgba(13,148,136,0.13) 40%, rgba(13,148,136,0.13) 60%, transparent 100%)",
      }}
    />

    {/* Corner glow — top-right */}
    <div
      className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[80px] opacity-20 dark:opacity-10"
      style={{ background: "radial-gradient(circle, #818cf8, transparent)" }}
    />

    {/* Corner glow — bottom-left */}
    <div
      className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] opacity-15 dark:opacity-8"
      style={{ background: "radial-gradient(circle, #f472b6, transparent)" }}
    />
  </div>
);

const Experience = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="experience"
      className="py-24 bg-gray-50 dark:bg-black/20 relative overflow-hidden"
    >
      {/* ── Decorative CSS background ── */}
      <ExperienceBg />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <SectionHeading title="Experience & Education" subtitle="Journey" />

        <div ref={containerRef} className="relative mt-20 max-w-5xl mx-auto">
          {/* Animated Central Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              style={{ scaleY: pathLength }}
              className="w-full h-full bg-gradient-to-b from-primary-500 via-primary-400 to-transparent origin-top rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
            />
          </div>

          <div className="space-y-12 md:space-y-8">
            {experiences.map((exp, i) => (
              <TimelineItem key={i} item={exp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
