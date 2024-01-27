"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MenuIcon from "@mui/icons-material/Menu";
import { AnimatePresence, motion } from "framer-motion";

import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { MobileAccountMenu } from "./Accounts/AccountsSections";
import { useSession } from "next-auth/react";

//fade in fade out
const variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
    },
    exit: {
        opacity: 0,
    },
};

const y_amount = 10;

const fadeInFromLeft = {
    initial: {
        x: -y_amount,
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
    },
    exit: {
        x: -y_amount,
        opacity: 0,
    },
};

const fadeInFromRight = {
    initial: {
        x: y_amount,
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
    },
    exit: {
        x: y_amount,
        opacity: 0,
    },
};

const fadeInFromTop = {
    initial: {
        y: -y_amount,
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
    },
    exit: {
        y: -y_amount,
        opacity: 0,
    },
};

const Header: React.FC = () => {
    const pathname = usePathname();

    const router = useRouter();

    const [isSearching, setIsSearching] = useState(false);

    const { data: session } = useSession();

    const [search, setSearch] = useState("");

    useEffect(() => {
        if (search.length > 0) {
            router.push("?q=" + encodeURIComponent(search));
        } else {
            router.push("/");
        }
    }, [search]);

    return (
        <>
            <header className="hidden sm:flex z-[100] justify-center flex-column items-center bg-[#111B21] sticky top-0  w-full text-center text-stone-50 h-16">
                <Link
                    href="/"
                    className=" text-2xl flex justify-center items-center"
                >
                    <img
                        src="/squealer.png"
                        width={50}
                        height={50}
                        alt="logo"
                    />
                    SQUEALER
                </Link>
            </header>
            <header className="sm:hidden z-[1100] flex flex-column items-center bg-[#111B21] sticky top-0 left-0  p-2 w-full text-center text-stone-50 h-16">
                <img src="/squealer.png" width={50} height={50} alt="logo" />
                <section className="flex-1 flex items-center">
                    {pathname === "/" ? (
                        <AnimatePresence mode="wait" initial={false}>
                            {!isSearching && (
                                <motion.div
                                    variants={fadeInFromLeft}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    key="logo"
                                    className="flex-1 w-full flex flex-row items-center"
                                    transition={{ duration: 0.15 }}
                                >
                                    <Link
                                        href="/"
                                        className=" text-2xl flex justify-center items-center"
                                    >
                                        SQUEALER
                                    </Link>
                                </motion.div>
                            )}

                            {!isSearching && (
                                <motion.button
                                    onClick={() => setIsSearching(!isSearching)}
                                    className="ml-auto mr-2"
                                    variants={fadeInFromRight}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    key="search-button"
                                >
                                    <SearchOutlined />
                                </motion.button>
                            )}

                            {isSearching && (
                                <motion.div
                                    variants={fadeInFromTop}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    key="search"
                                    transition={{ duration: 0.15 }}
                                    className=" rounded-md bg-gray-800 flex flex-row items-center px-2 mx-2"
                                >
                                    <motion.input
                                        type="text"
                                        className="rounded-md p-2 bg-gray-800 focus:outline-none w-[100%]"
                                        placeholder="Search"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        spellCheck={false}
                                        autoFocus
                                        onBlur={() => {
                                            if (search === "")
                                                setIsSearching(false);
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (search === "") {
                                                setIsSearching(false);
                                            } else {
                                                setSearch("");
                                            }
                                        }}
                                    >
                                        <CloseIcon />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        <Link
                            href="/"
                            className=" text-2xl flex justify-center items-center"
                        >
                            SQUEALER
                        </Link>
                    )}
                </section>

                <nav className="flex flex-row gap-2 items-center">
                    <AnimatePresence mode="wait">
                        {pathname === "/" ? (
                            <motion.button
                                variants={variants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                key="home-notifications"
                            >
                                <Link href="/Account/Notifications">
                                    <NotificationsNoneIcon />
                                </Link>
                            </motion.button>
                        ) : (
                            pathname === "/Account" && (
                                <motion.div
                                    variants={variants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    key="account"
                                >
                                    <MobileAccountMenu
                                        id={session?.user?.id}
                                        name={session?.user?.name}
                                    />
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </nav>
            </header>
        </>
    );
};

export default Header;
