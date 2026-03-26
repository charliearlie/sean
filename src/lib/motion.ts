import type { Variants, Transition } from "framer-motion";

export function fadeInUp(
  duration: number = 0.5,
  ease: string | number[] = "easeOut"
): Variants {
  return {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease } as Transition,
    },
  };
}

export function fadeIn(
  duration: number = 0.5,
  ease: string | number[] = "easeOut"
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration, ease } as Transition,
    },
  };
}

export function slideInLeft(
  duration: number = 0.5,
  ease: string | number[] = "easeOut"
): Variants {
  return {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration, ease } as Transition,
    },
  };
}

export function slideInRight(
  duration: number = 0.5,
  ease: string | number[] = "easeOut"
): Variants {
  return {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration, ease } as Transition,
    },
  };
}

export function staggerContainer(
  staggerChildren: number = 0.1,
  delayChildren: number = 0
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

export function scaleIn(
  duration: number = 0.4,
  ease: string | number[] = "easeOut"
): Variants {
  return {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration, ease } as Transition,
    },
  };
}

export function clipReveal(
  duration: number = 0.6,
  ease: string | number[] = "easeInOut"
): Variants {
  return {
    hidden: { clipPath: "inset(0 100% 0 0)" },
    visible: {
      clipPath: "inset(0 0% 0 0)",
      transition: { duration, ease } as Transition,
    },
  };
}
