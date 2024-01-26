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
import StorefrontIcon from "@mui/icons-material/Storefront";
import Spinner from "../Spinner";

import ForumIcon from "@mui/icons-material/Forum";

const Navbar = () => {
    const { user, status, isLoading } = useUser();

    const [openDialog, setOpenDialog] = useState(false);

    return (
        <>
            {!isLoading && (
                <nav className="fixed bottom-0 left-0 h-16 bg-[#111B21] w-full flex flex-row items-center justify-evenly  md:hidden z-[1100] text-slate-50">
                    <CustomLink href="/">
                        <HomeOutlinedIcon className="h-8 w-8" />
                    </CustomLink>

                    <CustomLink href="/Channels">
                        <ForumIcon className="h-8 w-8 text-gray-50" />
                    </CustomLink>
                    <CustomIcon
                        icon={<IconAdd className="h-8 w-8 text-gray-50" />}
                        onClick={() => setOpenDialog(!openDialog)}
                    />
                    <CustomLink href="/Shop">
                        <StorefrontIcon className="h-8 w-8" />
                    </CustomLink>
                    <CustomLink href="/Account">
                        {status === "authenticated" ? (
                            <img
                                src={`data:${user?.img?.mimetype};base64,${user?.img?.blob}`}
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
