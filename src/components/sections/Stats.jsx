import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import SectionHeading from "../ui/SectionHeading";
import {
  GitMerge,
  Layers,
  Users,
  Clock,
  Code2,
  Zap,
} from "lucide-react";

/* ─── Background ─── */
const StatsBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Dot grid */}
    <div
      className="absolute inset-0 opacity-[0.20] dark:opacity-[0.10]"
      style={{
        backgroundImage: "radial-gradient(circle, #0ea5e9 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    />

    {/* Orb — primary blue */}
    <motion.div
      animate={{ y: [0, -40, 0], x: [0, 30, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-32 -right-24 w-[500px] h-[500px] rounded-full blur-[110px] opacity-25 dark:opacity-15"
      style={{ background: "radial-gradient(circle, #0ea5e9, #6366f1)" }}
    />

    {/* Orb — purple */}
    <motion.div
      animate={{ y: [0, 50, 0], x: [0, -25, 0], scale: [1, 1.12, 1] }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full blur-[100px] opacity-20 dark:opacity-12"
      style={{ background: "radial-gradient(circle, #8b5cf6, #ec4899)" }}
    />

    {/* Horizontal scan line */}
    <motion.div
      animate={{ y: ["-100%", "900%"] }}
      transition={{ duration: 14, repeat: Infinity, ease: "linear", repeatDelay: 6 }}
      className="absolute left-0 right-0 h-px"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.3), transparent)",
      }}
    />
  </div>
);

/* ─── Animated Counter Hook ─── */
function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);

  return value;
}

/* ─── Single Stat Card ─── */
const StatCard = ({ stat, index, triggerCount }) => {
  const count = useCountUp(stat.value, 1600, triggerCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        type: "spring",
        stiffness: 90,
        damping: 14,
        delay: index * 0.12,
      }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="relative group glass rounded-3xl p-8 flex flex-col items-center text-center gap-4 border border-gray-100 dark:border-white/5 hover:border-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 cursor-default overflow-hidden"
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
      />

      {/* Icon bubble */}
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
        transition={{ duration: 0.4 }}
        className="p-4 rounded-2xl shadow-sm"
        style={{
          background: `${stat.color}18`,
          border: `1px solid ${stat.color}30`,
          color: stat.color,
        }}
      >
        <stat.icon size={28} />
      </motion.div>

      {/* Number */}
      <div className="space-y-1">
        <div className="flex items-end justify-center gap-0.5">
          <span
            className="text-5xl font-black tabular-nums"
            style={{
              background: `linear-gradient(135deg, ${stat.color}, ${stat.colorEnd})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {count}
          </span>
          <span
            className="text-3xl font-black mb-1"
            style={{
              background: `linear-gradient(135deg, ${stat.color}, ${stat.colorEnd})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {stat.suffix}
          </span>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[180px] mx-auto">
          {stat.desc}
        </p>
      </div>

      {/* Subtle inner glow on hover */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${stat.color}0A 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
};

/* ─── Stats Data ─── */
const statsData = [
  {
    icon: GitMerge,
    value: 20,
    suffix: "+",
    label: "Issues Resolved",
    desc: "Bugs debugged and fixed collaboratively across production codebases",
    color: "#0ea5e9",
    colorEnd: "#6366f1",
  },
  {
    icon: Layers,
    value: 4,
    suffix: "+",
    label: "Full-Stack Projects",
    desc: "End-to-end MERN applications built from scratch to deployment",
    color: "#8b5cf6",
    colorEnd: "#ec4899",
  },
  {
    icon: Code2,
    value: 15,
    suffix: "+",
    label: "Technologies Mastered",
    desc: "Languages, frameworks & tools across the full development stack",
    color: "#10b981",
    colorEnd: "#06b6d4",
  },
  {
    icon: Clock,
    value: 1,
    suffix: "+",
    label: "Years Experience",
    desc: "Professional full-stack development experience in production environments",
    color: "#f59e0b",
    colorEnd: "#f97316",
  },
  {
    icon: Users,
    value: 3,
    suffix: "+",
    label: "Team Collaborations",
    desc: "Cross-functional team projects using Agile & scrum methodologies",
    color: "#ec4899",
    colorEnd: "#8b5cf6",
  },
  {
    icon: Zap,
    value: 100,
    suffix: "%",
    label: "Commitment",
    desc: "Dedicated to delivering clean, performant, and scalable solutions",
    color: "#f97316",
    colorEnd: "#eab308",
  },
];

/* ─── Main Section ─── */
const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="stats" className="py-24 relative overflow-hidden">
      <StatsBg />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <SectionHeading title="Impact Numbers" subtitle="By The Numbers" />

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
        >
          {statsData.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} triggerCount={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
