"use client"

import { motion, type HTMLMotionProps } from "framer-motion"

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export function PageTransition({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerList({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" {...props}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={fadeUp} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} {...props}>
      {children}
    </motion.div>
  )
}
