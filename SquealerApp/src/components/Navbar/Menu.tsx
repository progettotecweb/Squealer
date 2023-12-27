"use client";

import Divider from "@/components/Divider";
import Container from "@mui/material/Container";

import CustomLink from "@/components/CustomLink";
import { useUser } from "@/hooks/useUser";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchOutlined } from "@mui/icons-material";
import NotificationMenu from "./NotificationMenu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

const MenuItem = ({
    text,
    href,
    icon,
    type = "Link",
    ignoreBreakpoint = false,
}: {
    text: string;
    href: string;
    icon?: React.ReactNode;
    type?: "Link" | "a";
    ignoreBreakpoint?: boolean;
}) => {
    return (
        <CustomLink
            href={href}
            className="mt-3 text-lg"
            innerClassName="flex flex-row items-center gap-1"
            type={type}
        >
            {icon}
            <div className={`${!ignoreBreakpoint && "hidden xl:block"}`}>
                {text}
            </div>
        </CustomLink>
    );
};

const secondaryMenus = {
    search: <div>Search</div>,
    default: <div>DEFAULT</div>,
    notifications: <NotificationMenu />,
    more: (
        <div className="p-2 rounded-md w-full text-slate-50 flex flex-col">
            {/* <div>
                {user ? (
                    <button
                        onClick={() =>
                            signOut({
                                callbackUrl: "/Home/Login",
                            })
                        }
                    >
                        Sign Out
                    </button>
                ) : (
                    <CustomLink href="/Login">Sign In</CustomLink>
                )}
            </div> */}
            <MenuItem
                text="Settings"
                href="/Settings"
                ignoreBreakpoint
                icon={<SettingsRoundedIcon />}
            />
            <MenuItem
                text="About"
                href="/About"
                ignoreBreakpoint
                icon={<InfoRoundedIcon />}
            />
            <MenuItem
                text="Contact"
                href="/Contact"
                ignoreBreakpoint
                icon={<MailOutlineRoundedIcon />}
            />
        </div>
    ),
};

const Menu = ({ onOpen }: { onOpen?: any }) => {
    const { user } = useUser();

    const [secondaryMenuOpen, setSecondaryMenuOpen] = useState(false);
    const [secondaryMenuType, setSecondaryMenuType] = useState("default");

    return (
        <div className="flex flex-row h-full">
            <AnimatePresence>
                <motion.div
                    layout
                    key="primary-menu"
                    role="presentation"
                    className="bg-slate-800 text-slate-50 h-full p-2 flex flex-col md:bg-[#111B21] border-r-slate-800 border-r-[1px]"
                >
                    {/* <section className="m-3">
                <h1>{user ? "@" + user.name : "Welcome guest!"}</h1>
                <ClientButton user={user} />
            </section>

            {user && (
                <>
                    <section className="m-3 flex flex-col gap-2">
                        <div>Daily: {user.msg_quota.daily}/1000</div>
                        <div>Weekly: {user.msg_quota.weekly}/6000</div>
                        <div>Monthly: {user.msg_quota.monthly}/24000</div>
                    </section>
                </>
            )} */}

                    <Container className="flex flex-col flex-1 p-2">
                        <MenuItem
                            text="Home"
                            href="/"
                            icon={<HomeOutlinedIcon />}
                        />

                        {user && (
                            <MenuItem
                                text="Profile"
                                href="/Account"
                                icon={
                                    <img
                                        src={`data:${user?.img.mimetype};base64,${user?.img.blob}`}
                                        alt="Profile Picture"
                                        className="w-6 h-6 rounded-full"
                                    />
                                }
                            />
                        )}
                        <MenuItem
                            text="Shop"
                            href="/Shop"
                            icon={<StorefrontIcon />}
                        />

                        {user && user.role == "Mod" && (
                            <MenuItem
                                text="Moderator Dashboard"
                                href="/Moderator"
                                type="a"
                                icon={<ManageAccountsIcon />}
                            />
                        )}
                        {user && (user.role == "SMM" || user.role == "Mod") && (
                            <MenuItem
                                text="SMM Dashboard"
                                href="/SMM"
                                type="a"
                                icon={<SupervisorAccountIcon />}
                            />
                        )}
                        <button
                            onClick={() => {
                                setSecondaryMenuType("search");
                                setSecondaryMenuOpen(!secondaryMenuOpen);
                            }}
                            className="flex flex-row gap-1 items-center text-lg mt-3 cursor-pointer"
                        >
                            <SearchOutlined />
                            <span className="hidden xl:block">Search</span>
                        </button>
                        <button
                            onClick={() => {
                                setSecondaryMenuType("notifications");
                                setSecondaryMenuOpen(!secondaryMenuOpen);
                            }}
                            className="flex flex-row gap-1 items-center text-lg mt-3 cursor-pointer"
                        >
                            <NotificationsNoneIcon />
                            <span className="hidden xl:block">
                                Notifications
                            </span>
                        </button>
                    </Container>
                    <Container className="flex flex-col mb-1 p-2">
                        <div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSecondaryMenuType("more");
                                    setSecondaryMenuOpen(!secondaryMenuOpen);
                                }}
                                className="flex flex-row items-center gap-1 text-lg"
                            >
                                <MenuIcon />
                                <span className="hidden xl:block">More</span>
                            </button>
                        </div>
                    </Container>
                </motion.div>
                {secondaryMenuOpen && (
                    <>
                        <motion.div
                            key="secondary-menu"
                            exit={{ opacity: 0 }}
                            // onClick={() => setSecondaryMenuOpen(false)}
                            className="absolute top-0 right-0 h-full w-[300px] p-2 rounded-r-2xl text-slate-50 bg-[#111B21] z-[-1] border-solid secondary-menu border-r-slate-800 border-r-[1px]"
                        >
                            {secondaryMenus[secondaryMenuType]}
                        </motion.div>
                        <motion.div
                            onClick={() => setSecondaryMenuOpen(false)}
                            className="fixed top-0 left-0 h-full w-full z-[-2]"
                        ></motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Menu;
