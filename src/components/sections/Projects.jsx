import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ExternalLink, Github, ArrowUpRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const ProjectsBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Diagonal stripe pattern */}
    <div
      className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, #6366f1 0px, #6366f1 1px, transparent 1px, transparent 20px)",
      }}
    />

    {/* Deep emerald orb — top left */}
    <motion.div
      animate={{ y: [0, -55, 0], x: [0, 40, 0], scale: [1, 1.12, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-36 -left-28 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 dark:opacity-14"
      style={{ background: "radial-gradient(circle, #10b981, #0ea5e9)" }}
    />

    {/* Orange/amber orb — bottom right */}
    <motion.div
      animate={{ y: [0, 50, 0], x: [0, -35, 0], scale: [1, 1.08, 1] }}
      transition={{
        duration: 26,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 4,
      }}
      className="absolute -bottom-28 -right-28 w-[460px] h-[460px] rounded-full blur-[110px] opacity-20 dark:opacity-12"
      style={{ background: "radial-gradient(circle, #f97316, #f59e0b)" }}
    />

    {/* Purple mid orb */}
    <motion.div
      animate={{ y: [0, 30, 0], scale: [1, 1.06, 1] }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 8,
      }}
      className="absolute top-1/2 -right-20 w-[350px] h-[350px] rounded-full blur-[90px] opacity-15 dark:opacity-8"
      style={{ background: "radial-gradient(circle, #a855f7, #6366f1)" }}
    />

    {/* Floating node particles */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ y: ["0%", "-100%"], opacity: [0, 0.6, 0] }}
        transition={{
          duration: 8 + i * 2,
          repeat: Infinity,
          ease: "easeOut",
          delay: i * 2.5,
        }}
        className="absolute w-1 h-1 rounded-full bg-primary-400"
        style={{
          left: `${15 + i * 14}%`,
          bottom: `${-5 + (i % 3) * 20}%`,
          boxShadow: "0 0 6px 2px rgba(14,165,233,0.6)",
        }}
      />
    ))}
  </div>
);

const projects = [
  {
    title: "IP TUTORIALS",
    date: "05/2025 – 11/2025",
    description:
      "Built a comprehensive student management system supporting 600+ students, handling attendance, exams, results, and various academic activities. Added real-time chat enabling instant communication among 30+ teachers, 20+ admins, and the super admin. Implemented 10+ detailed models, custom middleware, and robust RBAC for 5 user roles.",
    stack: ["React", "Node.js", "Express", "MongoDB", "Socket.io"],
    github: "",
    demo: "https://iptutorials.demobrains.com/",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Chat Application",
    date: "Recent",
    description:
      "Real-time messaging platform using Socket.io supporting 10,000+ active users. Integrated Socket.io with Redis Adapter for large-scale concurrent connections. Designed a fully responsive UI with theme customization, boosting user engagement by 40%. Optimized for instant message delivery and zero latency.",
    stack: ["React", "Socket.io", "Redis", "Node.js", "MongoDB"],
    github: "https://github.com/soham-tarabada/Chat-App-MERN",
    demo: "",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Bed Allocation System",
    date: "Recent",
    description:
      "Hospital resource management system serving 100+ patients seamlessly. Enabled real-time bed tracking and allocation. Integrated DataTables.net for dynamic patient listing with instant search, sort, and pagination. Built an optimized backend ensuring fast load times and zero buffering.",
    stack: ["MERN", "DataTables.net", "REST", "TailwindCSS"],
    github: "https://github.com/soham-tarabada/Bed_Allocation_MERN",
    demo: "",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    title: "Clothify",
    date: "Recent",
    description:
      "Full-featured MERN e-commerce app handling 500+ daily users. Designed an intuitive admin panel managing 1,000+ products and orders. Integrated Stripe payment gateway for secure, seamless transactions.",
    stack: ["React", "Node.js", "MongoDB", "Stripe", "Redux"],
    github: "https://github.com/soham-tarabada/E-Commerce",
    demo: "",
    color: "from-orange-500/20 to-amber-500/20",
  },
];

const ProjectCard = ({ project, index }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={onMouseMove}
      className="group relative flex flex-col h-full rounded-3xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 overflow-hidden cursor-pointer"
    >
      {/* Dynamic Glow Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 dark:group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative p-8 flex-1 flex flex-col z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="transform group-hover:-translate-y-1 transition-transform duration-300">
            <p className="text-sm font-bold text-primary-500 tracking-wider mb-2 uppercase">
              {project.date}
            </p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center gap-2">
              {project.title}
              <ArrowUpRight
                className="opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
                size={24}
              />
            </h3>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-8 flex-1 text-base leading-relaxed">
          {project.description}
        </p>

        {/* Technologies - Hover Reveal */}
        <div className="flex flex-wrap gap-2 mb-8">
          {project.stack.map((tech, i) => (
            <span
              key={i}
              className="text-xs font-bold px-4 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-white/10 group-hover:border-primary-500/50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-white/10">
          {project.github ? (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm shadow-md hover:shadow-xl transition-all"
            >
              <Github size={16} /> Code
            </motion.a>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-xl font-bold text-sm cursor-not-allowed select-none">
              <Github size={16} /> Private
            </span>
          )}
          {project.demo && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 hover:shadow-primary-500/40 hover:bg-primary-600 transition-all"
            >
              <ExternalLink size={16} /> Live Demo
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  return (
    <section id="projects" className="py-24 relative overflow-hidden">
      <ProjectsBg />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <SectionHeading title="Featured Projects" subtitle="Portfolio" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
          {projects.map((project, i) => (
            <ProjectCard key={i} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
