import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AnchorType = "top" | "left" | "bottom" | "right";

interface DrawerProps {
    open: boolean;
    anchor: AnchorType;
    children: React.ReactNode;
    onClose: () => void;
}

const duration = 0.15;

const variants = (anchor : AnchorType) => {
    return {
        hidden: {
            opacity: 1,
            x: anchor === "left" ? "-100%" : anchor === "right" ? "100%" : 0,
            y: anchor === "top" ? "-100%" : anchor === "bottom" ? "100%" : 0,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: duration,
            },
        },
        exit: {
            opacity: 1,
            x: anchor === "left" ? "-100%" : anchor === "right" ? "100%" : 0,
            y: anchor === "top" ? "-100%" : anchor === "bottom" ? "100%" : 0,
            transition: {
                duration: duration,
            },
        },
    };
}

const Drawer = ({ children, open, anchor, onClose }: DrawerProps) => {
    let anchorStyle = "";

    if (anchor === "top") {
        anchorStyle = "top-0 left-0 w-full";
    } else if (anchor === "left") {
        anchorStyle = "top-0 left-0  h-full";
    } else if (anchor === "bottom") {
        anchorStyle = "bottom-0 left-0 w-full ";
    } else if (anchor === "right") {
        anchorStyle = "top-0 right-0 h-full";
    }

    return (
        <AnimatePresence mode="sync">
            {open && (
                <motion.div
                    onTap={onClose}
                    key="backdrop"
                    className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5);] z-[5990]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: duration,
                    }}
                >
                </motion.div>
            )}
            {open && (
                <motion.div
                    className={`fixed ${anchorStyle} z-[6000]`}
                    variants={variants(anchor)}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layoutRoot
                    key="drawer"
                    transition= {{
                        duration: duration
                    }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Drawer;
