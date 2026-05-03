import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "../ui/SectionHeading";
import {
  GraduationCap,
  Briefcase,
  Award,
  ChevronDown,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";

/* ─── Timeline Data ─── */
const timelineData = [
  {
    id: 1,
    type: "edu",
    year: "2018–2019",
    title: "Secondary School Certificate",
    org: "Alembic Vidyalaya",
    location: "Vadodara",
    highlight: "92.5%",
    highlightLabel: "Score",
    desc: "Built a strong academic foundation in science and mathematics. Consistently ranked among top students and developed an early interest in computers and problem-solving.",
    tags: ["Science", "Mathematics", "Computers"],
    color: "#0ea5e9",
    colorEnd: "#6366f1",
    icon: GraduationCap,
  },
  {
    id: 2,
    type: "edu",
    year: "2020–2021",
    title: "HSC — Science Stream",
    org: "Parth School of Sci. and Comp.",
    location: "Vadodara",
    highlight: "89.69%",
    highlightLabel: "Score",
    desc: "Completed higher secondary education in Science with a strong focus on Physics, Chemistry & Maths. This phase cemented my decision to pursue Computer Engineering.",
    tags: ["Physics", "Chemistry", "Mathematics"],
    color: "#8b5cf6",
    colorEnd: "#ec4899",
    icon: GraduationCap,
  },
  {
    id: 3,
    type: "edu",
    year: "2021–2025",
    title: "B.E. — Computer Engineering",
    org: "Government Engineering College",
    location: "Gandhinagar",
    highlight: "7.87",
    highlightLabel: "CGPA",
    desc: "Developed a strong foundation in data structures, algorithms, operating systems, and software engineering. Worked on multiple academic projects involving web development and system design, ultimately specializing in full-stack MERN development.",
    tags: ["DSA", "MERN Stack", "Software Engineering", "Cloud"],
    color: "#10b981",
    colorEnd: "#06b6d4",
    icon: GraduationCap,
  },
  {
    id: 4,
    type: "work",
    year: "Jan 2025 – Apr 2025",
    title: "Intern — MERN Stack Developer",
    org: "Webbrains Technologies Pvt. Ltd.",
    location: "Vadodara",
    highlight: "20+",
    highlightLabel: "Issues Fixed",
    desc: "Joined as an intern and got hands-on experience building RESTful APIs, integrating frontends with backends, and working in a professional development environment. Collaborated with a team of 3 interns to debug and resolve 20+ live issues across active projects.",
    tags: ["Node.js", "Express", "MongoDB", "REST APIs", "Agile"],
    color: "#f59e0b",
    colorEnd: "#f97316",
    icon: Briefcase,
  },
  {
    id: 5,
    type: "work",
    year: "May 2025 – Present",
    title: "Jr. MERN Stack Developer",
    org: "Webbrains Technologies Pvt. Ltd.",
    location: "Vadodara",
    highlight: "Full-time",
    highlightLabel: "Role",
    desc: "Promoted to a full-time junior developer role based on internship performance. Building scalable and responsive web applications, applying DevOps knowledge including Docker & Kubernetes for deployment, and consistently delivering features within tight deadlines.",
    tags: ["React", "Node.js", "Docker", "Kubernetes", "AWS"],
    color: "#ec4899",
    colorEnd: "#8b5cf6",
    icon: Award,
    isCurrent: true,
  },
];

/* ─── Background Decorator ─── */
const TimelineBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <div
      className="absolute inset-0 opacity-[0.18] dark:opacity-[0.10]"
      style={{
        backgroundImage: "radial-gradient(circle, #8b5cf6 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
    <motion.div
      animate={{ y: [0, -45, 0], x: [0, 28, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-28 -right-20 w-[480px] h-[480px] rounded-full blur-[110px] opacity-20 dark:opacity-12"
      style={{ background: "radial-gradient(circle, #8b5cf6, #6366f1)" }}
    />
    <motion.div
      animate={{ y: [0, 42, 0], x: [0, -22, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] opacity-18 dark:opacity-10"
      style={{ background: "radial-gradient(circle, #0ea5e9, #10b981)" }}
    />
    {/* Subtle vertical center line hint */}
    <div
      className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden lg:block"
      style={{
        background: "linear-gradient(to bottom, transparent, rgba(139,92,246,0.08) 20%, rgba(14,165,233,0.08) 80%, transparent)",
      }}
    />
  </div>
);

/* ─── Expanded Detail Panel ─── */
const DetailPane = ({ item }) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.35, ease: "easeInOut" }}
    className="overflow-hidden"
  >
    <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
        {item.desc}
      </p>
      <div className="flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: `${item.color}15`,
              color: item.color,
              border: `1px solid ${item.color}30`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

/* ─── Single Timeline Card ─── */
const TimelineCard = ({ item, index, isLeft }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon;

  return (
    <div className={`relative flex items-start gap-0 ${isLeft ? "md:flex-row-reverse" : "md:flex-row"} flex-col`}>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 85, damping: 14, delay: index * 0.1 }}
        className="w-full md:w-[calc(50%-2.5rem)] relative"
      >
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => setExpanded(!expanded)}
          className="glass rounded-3xl p-6 border border-gray-100 dark:border-white/5 hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/8 transition-all duration-300 cursor-pointer group relative overflow-hidden"
        >
          {/* Left accent bar */}
          <div
            className="absolute top-0 bottom-0 left-0 w-1 rounded-l-3xl scale-y-0 group-hover:scale-y-100 transition-transform duration-400 origin-top"
            style={{ background: `linear-gradient(to bottom, ${item.color}, ${item.colorEnd})` }}
          />

          {/* Current badge */}
          {item.isCurrent && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: item.color }}
                />
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${item.color}18`, color: item.color }}
              >
                Current
              </span>
            </div>
          )}

          {/* Header row */}
          <div className="flex items-start gap-4 mb-4">
            {/* Icon */}
            <div
              className="p-3 rounded-2xl flex-shrink-0 mt-0.5"
              style={{
                background: `${item.color}15`,
                border: `1px solid ${item.color}25`,
                color: item.color,
              }}
            >
              <Icon size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors leading-snug pr-16">
                {item.title}
              </h3>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mt-0.5">
                {item.org}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <Calendar size={12} />
              {item.year}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <MapPin size={12} />
              {item.location}
            </span>
            {/* Highlight pill */}
            <span
              className="ml-auto text-xs font-black px-3 py-1 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${item.color}22, ${item.colorEnd}22)`,
                border: `1px solid ${item.color}35`,
                color: item.color,
              }}
            >
              {item.highlight} {item.highlightLabel}
            </span>
          </div>

          {/* Expand / Collapse trigger */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {expanded ? "Click to collapse" : "Click to expand details"}
            </span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="p-1 rounded-full"
              style={{ color: item.color }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </div>

          {/* Expandable detail */}
          <AnimatePresence>{expanded && <DetailPane item={item} />}</AnimatePresence>
        </motion.div>

        {/* Connector line from card to center node — desktop */}
        <div
          className={`hidden md:block absolute top-8 w-10 h-px ${
            isLeft ? "right-0 translate-x-full" : "left-0 -translate-x-full"
          }`}
          style={{
            background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${item.color}80, transparent)`,
          }}
        />
      </motion.div>

      {/* Centre dot — desktop */}
      <div className="hidden md:flex flex-shrink-0 w-20 justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.25 }}
          className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-10 relative"
          style={{
            background: `linear-gradient(135deg, ${item.color}, ${item.colorEnd})`,
            boxShadow: `0 0 16px 3px ${item.color}40`,
          }}
        >
          <Icon size={18} className="text-white" />
        </motion.div>
      </div>

      {/* Spacer on the other side — desktop */}
      <div className="hidden md:block w-[calc(50%-2.5rem)]" />

      {/* Left mobile dot */}
      <div
        className="md:hidden absolute -left-3 sm:-left-5 top-7 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center z-10 shadow-md flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${item.color}, ${item.colorEnd})`,
          boxShadow: `0 0 10px 2px ${item.color}35`,
        }}
      >
        <Icon size={13} className="text-white" />
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const Timeline = () => {
  return (
    <section id="timeline" className="py-24 bg-gray-50 dark:bg-black/20 relative overflow-hidden">
      <TimelineBg />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <SectionHeading title="My Journey" subtitle="Career Timeline" />

        {/* Central vertical line — desktop */}
        <div className="relative mt-12">
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 w-0.5 h-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="w-full h-full origin-top rounded-full"
              style={{
                background:
                  "linear-gradient(to bottom, #0ea5e9, #8b5cf6, #ec4899, #f59e0b, #10b981)",
                boxShadow: "0 0 10px rgba(14,165,233,0.4)",
              }}
            />
          </div>

          {/* Mobile vertical line */}
          <div className="md:hidden absolute left-0 top-0 w-0.5 h-full bg-gray-200 dark:bg-gray-700 rounded-full ml-[-1rem]">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="w-full h-full origin-top rounded-full"
              style={{
                background: "linear-gradient(to bottom, #0ea5e9, #8b5cf6, #ec4899, #f59e0b, #10b981)",
              }}
            />
          </div>

          {/* Timeline items */}
          <div className="space-y-10 md:space-y-8 pl-4 sm:pl-6 md:pl-0">
            {timelineData.map((item, index) => (
              <TimelineCard
                key={item.id}
                item={item}
                index={index}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
