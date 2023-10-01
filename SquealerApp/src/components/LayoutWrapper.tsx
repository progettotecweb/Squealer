"use client";

import { AnimatePresence } from "framer-motion";

interface LayoutWrapperProps {
    children: React.ReactNode;
}

// #TODO-gianlo: see if they fix this in the future. 
// For now, exit animations for pages don't work with AnimatePresence (https://github.com/framer/motion/issues/1850)
// should however work in general with other components; need to test this out.

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
    return (
        <AnimatePresence mode="wait">
            {children}
        </AnimatePresence>
    );
};

export default LayoutWrapper;