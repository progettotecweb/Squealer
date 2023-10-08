"use client";

import { useState, cloneElement } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TabProps {
    label: string;
    content?: React.ReactNode;
    activeTab?: number;
    setActiveTab?: React.Dispatch<React.SetStateAction<number>>;
    index?: number;
}

export const Tab: React.FC<TabProps> = ({
    label,
    activeTab,
    setActiveTab,
    index,
}) => {
    return (
        <button
            className={`py-2 px-4 text-sm font-medium text-center text-slate-50 focus:outline-none border-solid border-b-4 ${
                activeTab === index
                    ? " border-b-blue-500"
                    : "border-transparent"
            }`}
            onClick={() => setActiveTab?.(index ? index : 0)}
        >
            {label}
        </button>
    );
};

const variants = {
    initial: {
        opacity: 0,
        x: 20,
    },
    animate: {
        opacity: 1,
        x: 0,
    },
    exit: {
        opacity: 0,
        x: -20,
    },
};

export const AnimatedTabContent: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    return (
        <motion.div
            key="tab-content"
            className="text-slate-50"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {children}
        </motion.div>
    );
};

type AcceptedChildren = React.ReactElement<TabProps>[];

interface TabsProps {
    children: AcceptedChildren;
    tabsClasses?: string;
    contentClasses?: string;
}

const Tabs: React.FC<TabsProps> = ({
    children,
    tabsClasses,
    contentClasses,
}) => {
    const [activeTab, setActiveTab] = useState(0);

    const changeTab = (index: number) => {
        setActiveTab(index);
    };

    return (
        <>
            <div
                className={`flex flex-col w-full items-center justify-center m-2 ${tabsClasses}`}
            >
                <div className="flex flex-row">
                    {children.map((child, index) => {
                        return cloneElement(child, {
                            activeTab: activeTab,
                            setActiveTab: changeTab,
                            index: index,
                            key: index,
                        });
                    })}
                </div>
            </div>
            <div className={contentClasses}>
                <AnimatePresence mode="wait">
                    {children[activeTab].props.content &&
                        cloneElement(
                            children[activeTab].props
                                .content as React.ReactElement,
                            { key: activeTab }
                        )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default Tabs;
