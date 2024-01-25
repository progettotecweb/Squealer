"use client";

import CustomLink from "@/components/CustomLink";
import { useUser } from "@/hooks/useUser";

import StorefrontIcon from "@mui/icons-material/Storefront";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

const MobileMenuLink = (props: {
    icon: React.ReactNode;
    href: string;
    title: string;
}) => {
    return (
        <CustomLink
            href={props.href}
            className="text-2xl"
            innerClassName="flex flex-row items-center gap-2"
        >
            {props.icon}
            {props.title}
        </CustomLink>
    );
};

const Menu = () => {
    const { user } = useUser();

    return (
        <div className="flex flex-col h-full w-full z-[2067] bg-[rgb(17,_27,_33)] text-white p-4">
            Welcome, {user?.name}
            <MobileMenuLink
                title="Home"
                href="/"
                icon={<HomeOutlinedIcon className="w-10 h-10" />}
            />
            <MobileMenuLink
                title="Profile"
                href="/Account"
                icon={
                    <img
                        src={`data:${user?.img?.mimetype};base64,${user?.img?.blob}`}
                        alt="Profile Picture"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                }
            />
            <MobileMenuLink
                title="Home"
                href="/"
                icon={<HomeOutlinedIcon className="" />}
            />
        </div>
    );
};

export default Menu;
