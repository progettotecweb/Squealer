import React from "react";

import Header from "./Header";
import Navbar from "./Navbar";

import { motion } from "framer-motion";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

let easing = [0.6, -0.05, 0.01, 0.99];

const fadeInUp = {
  initial: {
    opacity: 0,
    transition: { duration: 0.6, ease: easing },
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easing,
    },
  },
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
}) => {
  return (
    <motion.main
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit={{ opacity: 0 }}
      className={`bg-slate-700 flex flex-col justify-center items-center text-center text-w ${className} `}
    >
        {children}
    </motion.main>
  );
};

export default PageContainer;
