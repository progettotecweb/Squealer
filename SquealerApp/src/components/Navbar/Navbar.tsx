"use client";

import { useState } from "react";

import IconAccountCircle from "@/icons/AccountIcon";
import IconAdd from "@/icons/AddIcon";

import Box from "@mui/material/Box";

import CustomIcon from "@/components/CustomIcon";
import SquealCreator from "@/components/Navbar/SquealCreator";
import { useUser } from "@/hooks/useUser";
import { Drawer as MUIDrawer } from "@mui/material";
import CustomLink from "../CustomLink";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";


import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

import Spinner from "../Spinner";

import ForumIconOutlined from '@mui/icons-material/ForumOutlined';
import ForumIcon from "@mui/icons-material/Forum";

import { usePathname } from "next/navigation";

const Navbar = () => {
    const { user, status, isLoading } = useUser();

    const [openDialog, setOpenDialog] = useState(false);

    const pathname = usePathname();

    return (
        <>
            {!isLoading && (
                <nav className="fixed bottom-0 left-0 h-16 bg-[#111B21] w-full flex flex-row items-center justify-evenly  md:hidden z-[1100] text-slate-50">
                    <CustomLink href="/">
                        {pathname === "/" ? <HomeIcon className="h-8 w-8" /> : <HomeOutlinedIcon className="h-8 w-8" />}
                    </CustomLink>
                    {status === "authenticated" && 
                    <CustomLink href="/Channels">
                        {pathname?.startsWith("/Channels") ? <ForumIcon className="h-8 w-8 text-gray-50" /> : <ForumIconOutlined className="h-8 w-8" />}
                    </CustomLink>}
                    {status === "authenticated" && 
                    <CustomIcon
                        icon={<IconAdd className="h-8 w-8 text-gray-50" />}
                        onClick={() => setOpenDialog(!openDialog)}
                    />}
                    {status === "authenticated" && 
                    <CustomLink href="/Shop">
                        {pathname?.startsWith("/Shop") ? <ShoppingBagIcon className="h-8 w-8" /> : <ShoppingBagOutlinedIcon className="h-8 w-8" />}
                    </CustomLink>}
                    <CustomLink href="/Account">
                        {status === "authenticated" ? (
                            <img
                                src={`/api/media/${user?.img}`}
                                alt="Profile Picture"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : status === "loading" ? (
                            <Spinner className="w-8 h-8" />
                        ) : (
                            <IconAccountCircle className="h-8 w-8 text-gray-50" />
                        )}
                    </CustomLink>
                </nav>
            )}
            <MUIDrawer
                open={openDialog}
                anchor="bottom"
                onClose={() => setOpenDialog(false)}
            >
                <Box className="bg-[#111B21] h-[70vh]">
                    <SquealCreator />
                </Box>
            </MUIDrawer>
        </>
    );
};

export default Navbar;
