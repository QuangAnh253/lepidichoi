"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export function MotionStagger({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="contents">
      {children}
    </motion.div>
  );
}

export function MotionItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={item} className="contents">
      {children}
    </motion.div>
  );
}
