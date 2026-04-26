import React, { useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "../ui/SectionHeading";

const SkillsBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Cross-hair dot grid */}
    <div
      className="absolute inset-0 opacity-[0.22] dark:opacity-[0.14]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #06b6d4 1px, transparent 1px), radial-gradient(circle, #06b6d4 1px, transparent 1px)",
        backgroundSize: "40px 40px, 40px 40px",
        backgroundPosition: "0 0, 20px 20px",
      }}
    />

    {/* Neon cyan orb — top left */}
    <motion.div
      animate={{ y: [0, -45, 0], x: [0, 30, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-28 -left-20 w-[440px] h-[440px] rounded-full blur-[100px] opacity-25 dark:opacity-15"
      style={{ background: "radial-gradient(circle, #06b6d4, #3b82f6)" }}
    />

    {/* Neon cyan orb — bottom right */}
    <motion.div
      animate={{ y: [0, 40, 0], x: [0, -20, 0], scale: [1, 1.08, 1] }}
      transition={{
        duration: 23,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 4,
      }}
      className="absolute -bottom-24 -right-24 w-[380px] h-[380px] rounded-full blur-[90px] opacity-20 dark:opacity-12"
      style={{ background: "radial-gradient(circle, #22d3ee, #818cf8)" }}
    />

    {/* Horizontal scan line 1 */}
    <motion.div
      animate={{ y: ["-100%", "800%"] }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 5,
      }}
      className="absolute left-0 right-0 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(6,182,212,0.35), transparent)",
      }}
    />

    {/* Horizontal scan line 2 */}
    <motion.div
      animate={{ y: ["-100%", "800%"] }}
      transition={{
        duration: 16,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 8,
        delay: 6,
      }}
      className="absolute left-0 right-0 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
      }}
    />

    {/* Corner accent — bottom left */}
    <div
      className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-[70px] opacity-15 dark:opacity-8"
      style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }}
    />
  </div>
);
import {
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiRedux,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiGit,
  SiGithub,
  SiDocker,
  SiKubernetes,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { Bug, Users } from "lucide-react";

const skillsData = [
  {
    category: "Frontend",
    items: [
      {
        name: "HTML & CSS",
        icon: (
          <div className="flex -space-x-1">
            <SiHtml5 className="text-[#E34F26]" />
            <SiCss className="text-[#1572B6]" />
          </div>
        ),
        color: "hover:border-[#E34F26]/50 hover:shadow-[#E34F26]/20",
        glowColor: "#E34F26",
        description:
          "The backbone of the web. HTML5 for semantic structure paired with CSS3 for responsive, modern, and visually rich layouts — including Flexbox, Grid, animations, and custom properties.",
      },
      {
        name: "Tailwind CSS",
        icon: <SiTailwindcss className="text-[#06B6D4]" />,
        color: "hover:border-[#06B6D4]/50 hover:shadow-[#06B6D4]/20",
        glowColor: "#06B6D4",
        description:
          "A utility-first CSS framework that enables rapid UI development with consistent design tokens. Excellent for building responsive, dark-mode-ready interfaces without leaving your JSX.",
      },
      {
        name: "JavaScript",
        icon: <SiJavascript className="text-[#F7DF1E]" />,
        color: "hover:border-[#F7DF1E]/50 hover:shadow-[#F7DF1E]/20",
        glowColor: "#F7DF1E",
        description:
          "The language of the web. Proficient in ES6+, async/await, closures, DOM manipulation, and event-driven programming to build dynamic, interactive user experiences.",
      },
      {
        name: "TypeScript",
        icon: <SiTypescript className="text-[#3178C6]" />,
        color: "hover:border-[#3178C6]/50 hover:shadow-[#3178C6]/20",
        glowColor: "#3178C6",
        description:
          "A strongly-typed superset of JavaScript that improves code quality, catches bugs early, and enhances IDE support — critical for scalable, team-based projects.",
      },
      {
        name: "React.js",
        icon: <SiReact className="text-[#61DAFB]" />,
        color: "hover:border-[#61DAFB]/50 hover:shadow-[#61DAFB]/20",
        glowColor: "#61DAFB",
        description:
          "A declarative UI library for building component-based single-page applications. Deep expertise in hooks (useState, useEffect, useContext, custom hooks), state management, and performance optimization.",
      },
      {
        name: "Next.js",
        icon: <SiNextdotjs className="dark:text-white text-black" />,
        color: "hover:border-gray-500/50 hover:shadow-gray-500/20",
        glowColor: "#ffffff",
        description:
          "A full-stack React framework with server-side rendering, static site generation, API routes, and the App Router — enabling fast, SEO-friendly web applications.",
      },
      {
        name: "Redux-Toolkit",
        icon: <SiRedux className="text-[#764ABC]" />,
        color: "hover:border-[#764ABC]/50 hover:shadow-[#764ABC]/20",
        glowColor: "#764ABC",
        description:
          "The official, opinionated toolset for Redux state management. Used for managing complex global state in large-scale React applications with slices, thunks, and RTK Query.",
      },
    ],
  },
  {
    category: "Backend",
    items: [
      {
        name: "Node.js",
        icon: <SiNodedotjs className="text-[#339933]" />,
        color: "hover:border-[#339933]/50 hover:shadow-[#339933]/20",
        glowColor: "#339933",
        description:
          "A JavaScript runtime built on Chrome's V8 engine for building fast, scalable server-side applications. Used for building REST APIs, real-time apps, and CLI tools.",
      },
      {
        name: "Express.js",
        icon: <SiExpress className="dark:text-white text-black" />,
        color: "hover:border-gray-500/50 hover:shadow-gray-500/20",
        glowColor: "#888888",
        description:
          "A minimal, unopinionated Node.js web framework for building RESTful APIs and server-rendered apps. Expertise in middleware, routing, error handling, and authentication.",
      },
    ],
  },
  {
    category: "Databases",
    items: [
      {
        name: "MongoDB",
        icon: <SiMongodb className="text-[#47A248]" />,
        color: "hover:border-[#47A248]/50 hover:shadow-[#47A248]/20",
        glowColor: "#47A248",
        description:
          "A NoSQL document database used alongside Mongoose ODM for schema-based data modeling. Skilled in aggregation pipelines, indexing, and designing scalable data architectures.",
      },
    ],
  },
  {
    category: "DevOps",
    items: [
      {
        name: "Docker",
        icon: <SiDocker className="text-[#2496ED]" />,
        color: "hover:border-[#2496ED]/50 hover:shadow-[#2496ED]/20",
        glowColor: "#2496ED",
        description:
          "Containerization of frontend and backend applications using Docker and Docker Hub. Experienced in writing Dockerfiles, managing images, and deploying multi-container setups for consistent environments.",
      },
      {
        name: "Kubernetes (K8s)",
        icon: <SiKubernetes className="text-[#326CE5]" />,
        color: "hover:border-[#326CE5]/50 hover:shadow-[#326CE5]/20",
        glowColor: "#326CE5",
        description:
          "Foundational knowledge of Kubernetes for container orchestration — including pods, deployments, services, and scaling strategies for cloud-native application deployment.",
      },
      {
        name: "AWS",
        icon: <FaAws className="text-[#FF9900]" />,
        color: "hover:border-[#FF9900]/50 hover:shadow-[#FF9900]/20",
        glowColor: "#FF9900",
        description:
          "Cloud infrastructure management on Amazon Web Services — including VPC networking, EC2 compute, S3 storage, Load Balancing, Security Groups, and IAM for secure, scalable cloud-native deployments.",
      },
    ],
  },
  {
    category: "Tools & Others",
    items: [
      {
        name: "Git & GitHub",
        icon: (
          <div className="flex -space-x-1">
            <SiGit className="text-[#F05032]" />
            <SiGithub className="dark:text-white text-black z-10" />
          </div>
        ),
        color: "hover:border-[#F05032]/50 hover:shadow-[#F05032]/20",
        glowColor: "#F05032",
        description:
          "Version control and collaborative development using Git (branching, rebasing, cherry-picking) and GitHub (pull requests, code reviews, Actions for CI/CD).",
      },
      {
        name: "Debugging",
        icon: <Bug className="text-red-500" size={16} />,
        color: "hover:border-red-500/50 hover:shadow-red-500/20",
        glowColor: "#ef4444",
        description:
          "Systematic use of browser DevTools, breakpoints, network inspection, and error tracing to diagnose and resolve complex bugs in both frontend and backend codebases.",
      },
      {
        name: "Teamwork",
        icon: <Users className="text-blue-500" size={16} />,
        color: "hover:border-blue-500/50 hover:shadow-blue-500/20",
        glowColor: "#3b82f6",
        description:
          "Strong collaborator experienced in Agile workflows, scrum sprints, and cross-functional teams. Comfortable with async communication, code reviews, and pair programming.",
      },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

// Portal-based modal rendered into document.body
const SkillModal = ({ skill, position }) => {
  if (!skill) return null;

  const MODAL_WIDTH = 280;
  const MODAL_HEIGHT = 160;
  const OFFSET_X = 16;
  const OFFSET_Y = 16;

  // Smart positioning: keep modal inside viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x = position.x + OFFSET_X;
  let y = position.y + OFFSET_Y;
  if (x + MODAL_WIDTH > vw - 8) x = position.x - MODAL_WIDTH - OFFSET_X;
  if (y + MODAL_HEIGHT > vh - 8) y = position.y - MODAL_HEIGHT - OFFSET_Y;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {skill && (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, scale: 0.75, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.75, y: 10 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          style={{
            position: "fixed",
            top: y,
            left: x,
            zIndex: 99999,
            width: MODAL_WIDTH,
            pointerEvents: "none",
            boxShadow: `0 0 24px 4px ${skill.glowColor}33, 0 8px 32px rgba(0,0,0,0.25)`,
            border: `1px solid ${skill.glowColor}44`,
          }}
          className="rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 p-4"
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${skill.glowColor}, transparent)`,
            }}
          />

          {/* Icon + Name row */}
          <div className="flex items-center gap-3 mb-2.5">
            <span
              className="text-2xl p-2 rounded-xl shadow-inner"
              style={{
                background: `${skill.glowColor}18`,
                border: `1px solid ${skill.glowColor}30`,
              }}
            >
              {skill.icon}
            </span>
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: skill.glowColor }}
              >
                Skill
              </p>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                {skill.name}
              </h4>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {skill.description}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

const Skills = () => {
  const [activeSkill, setActiveSkill] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);

  const handleMouseEnter = useCallback((skill, e) => {
    clearTimeout(timeoutRef.current);
    setMousePos({ x: e.clientX, y: e.clientY });
    setActiveSkill(skill);
  }, []);

  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveSkill(null), 80);
  }, []);

  return (
    <section
      id="skills"
      className="py-20 bg-gray-50 dark:bg-black/20 relative overflow-hidden"
    >
      <SkillsBg />
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <SectionHeading title="My Skills" subtitle="Technologies" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillsData.map((skillGroup, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
              className="glass p-8 rounded-3xl"
            >
              <h3 className="text-xl font-bold mb-6 text-primary-500 flex items-center gap-2">
                <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-4">
                {skillGroup.items.map((skill, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.08, y: -5 }}
                    onMouseEnter={(e) => handleMouseEnter(skill, e)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={`flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 rounded-2xl text-sm font-semibold shadow-sm border border-gray-100 dark:border-gray-700/50 cursor-default transition-all duration-300 ${skill.color} hover:shadow-lg`}
                  >
                    <span className="text-lg bg-gray-50 dark:bg-gray-900 p-1.5 rounded-lg shadow-inner">
                      {skill.icon}
                    </span>
                    <span>{skill.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <SkillModal skill={activeSkill} position={mousePos} />
    </section>
  );
};

export default Skills;
