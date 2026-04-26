"use client";
import { motion } from "framer-motion";

export function GradientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #c9a961 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #3B82F6 0%, transparent 60%)",
          filter: "blur(100px)",
        }}
        animate={{
          x: [0, -80, 40, 0],
          y: [0, -60, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/4 h-[450px] w-[450px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #10B981 0%, transparent 60%)",
          filter: "blur(90px)",
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
