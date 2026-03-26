"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { cipherTokens } from "@/concepts/cipher/tokens";

const { motion: motionTokens } = cipherTokens;

interface MotionWrapperProps {
  children: React.ReactNode;
  variant?: Variants;
  className?: string;
}

export default function MotionWrapper({
  children,
  variant,
  className,
}: MotionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const v = variant ?? fadeInUp(motionTokens.duration, motionTokens.ease);

  return (
    <motion.div
      ref={ref}
      variants={v}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}
