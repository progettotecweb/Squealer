"use client";

import { motion } from "framer-motion";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;

}

let easing = [0.6, -0.05, 0.01, 0.99];

const fadeInUp = {
    initial: {
        y: -20,
        opacity: 0,
        transition: { duration: 0.6, ease: easing },
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: easing,
        },
    },
    exit: {
        y: -100,
        opacity: 0,
        transition: {
            duration:2,
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
            exit="exit"
            className={`bg-[#111B21] flex flex-col justify-center items-center text-center text-w ${className} text-slate-50`}
        >
            {children}
        </motion.main>
    );
};

export default PageContainer;
