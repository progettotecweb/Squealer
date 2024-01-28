"use client";

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
import { AnimatePresence, motion } from "framer-motion";
import SearchOutlined from "@mui/icons-material/SearchOutlined"; 
import NotificationMenu from "./NotificationMenu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ForumIcon from "@mui/icons-material/Forum";
import Dialog from "@mui/material/Dialog";
import SquealCreator from "./SquealCreator";
import SearchMenu from "./SearchMenu";
import useSignout from "@/hooks/useSignout";

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
            className="mt-5 text-lg"
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
    search: <SearchMenu />,
    default: <div>DEFAULT</div>,
    notifications: <NotificationMenu />,
};

const Menu = ({ onOpen }: { onOpen?: any }) => {
    const { user } = useUser();

    const [secondaryMenuOpen, setSecondaryMenuOpen] = useState(false);
    const [secondaryMenuType, setSecondaryMenuType] = useState("default");

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const signOut = useSignout();

    return (
        <div className="flex flex-row h-full z-[2067]">
            <AnimatePresence>
            {user && (<motion.div
                    layout
                    key="primary-menu"
                    role="presentation"
                    className="bg-gray-800 text-gray-50 h-full p-6 flex flex-col md:bg-[#111B21] border-r-slate-800 border-r-[1px] items-center sm:items-start"
                >
                    {/* <section className="m-3">
                <h1>{user ? "@" + user.name : "Welcome guest!"}</h1>
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
                    <div>
                        {user ? (
                            <button
                                className="bg-gray-700 px-8 py-2 rounded-md grid place-content-center hover:bg-gray-800 transition-colors"
                                onClick={() =>
                                    signOut()
                                }
                            >
                                Sign Out
                            </button>
                        ) : (
                            <CustomLink href="/Login" className=" bg-gray-600 rounded-md grid place-content-center hover:bg-gray-700 transition-colors"
                            innerClassName="py-2 px-8  ">Sign In</CustomLink>
                        )}
                    </div>

                    <section className="flex flex-col flex-1 gap-6">
                        <MenuItem
                            text="Home"
                            href="/"
                            icon={<HomeOutlinedIcon className="w-8 h-8" />}
                        />

                        {user && (
                            <MenuItem
                                text="Profile"
                                href="/Account"
                                icon={
                                    <img
                                        src={`/api/media/${user.img}`}
                                        alt="Profile Picture"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                }
                            />
                        )}
                        <MenuItem
                            text="Channels"
                            href="/Channels"
                            icon={<ForumIcon />}
                        />
                        {user && (
                        <MenuItem
                            text="Shop"
                            href="/Shop"
                            icon={<StorefrontIcon className="w-8 h-8" />}
                        />
                        )}

                        {user && user.role == "Mod" && (
                            <MenuItem
                                text="Moderator Dashboard"
                                href="/Moderator"
                                type="a"
                                icon={
                                    <ManageAccountsIcon className="w-8 h-8" />
                                }
                            />
                        )}
                        {user && (user.role == "SMM" || user.role == "Mod") && (
                            <MenuItem
                                text="SMM Dashboard"
                                href="/SMM"
                                type="a"
                                icon={
                                    <SupervisorAccountIcon className="w-8 h-8" />
                                }
                            />
                        )}
                        <button
                            onClick={() => {
                                setSecondaryMenuType("search");
                                setSecondaryMenuOpen(!secondaryMenuOpen);
                            }}
                            className="flex flex-row gap-1 items-center text-lg mt-5 cursor-pointer"
                        >
                            <SearchOutlined className="w-8 h-8" />
                            <span className="hidden xl:block">Search</span>
                        </button>
                        {user && (
                        <button
                            onClick={() => {
                                setSecondaryMenuType("notifications");
                                setSecondaryMenuOpen(!secondaryMenuOpen);
                            }}
                            className="flex flex-row gap-1 items-center text-lg mt-5 cursor-pointer"
                        >
                            <NotificationsNoneIcon className="w-8 h-8" />
                            <span className="hidden xl:block">
                                Notifications
                            </span>
                        </button>
                        )}
                    </section>
                    
                </motion.div>)}
                {secondaryMenuOpen && (
                    <>
                        <motion.div
                            key="secondary-menu"
                            exit={{ opacity: 0 }}
                            //onClick={() => setSecondaryMenuOpen(false)}
                            className="absolute top-0 right-0 h-full w-[300px] p-2 rounded-r-2xl text-gray-50 bg-[#111B21] z-[-1] border-solid secondary-menu border-r-slate-800 border-r-[1px]"
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
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <SquealCreator />
            </Dialog>
        </div>
    );
};

export default Menu;
