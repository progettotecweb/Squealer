"use client";

import { useState } from "react";

import SearchIcon from "@/icons/SearchIcon";
import IconAccountCircle from "@/icons/AccountIcon";
import IconAdd from "@/icons/AddIcon";

import Box from "@mui/material/Box";

import CustomIcon from "@/components/CustomIcon";
import Menu from "@/components/Navbar/Mobile/Menu";
import SquealCreator from "@/components/Navbar/SquealCreator";
import Searchbar from "@/components/Navbar/Searchbar";
import { useUser } from "@/hooks/useUser";
import { Drawer as MUIDrawer } from "@mui/material";
import CustomLink from "../CustomLink";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Spinner from "../Spinner";

const Navbar = () => {
    const { user, status, isLoading } = useUser();

    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);

    return (
        <>
            {!isLoading && (
                <nav className="fixed bottom-0 left-0 h-16 bg-[#111B21] w-full flex flex-row items-center justify-evenly  md:hidden z-[1100] text-slate-50">
                    <CustomLink href="/">
                        <HomeOutlinedIcon className="h-8 w-8" />
                    </CustomLink>

                    <CustomIcon
                        icon={<SearchIcon className="h-8 w-8 text-gray-50" />}
                        onClick={() => setOpenSearch(!openSearch)}
                    />
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

            {/*<Drawer open={open} anchor="left" onClose={() => setOpen(false)}>
                <Menu user={user}/>
            </Drawer>*/}
            {/* <MUIDrawer anchor="left" open={open} onClose={() => setOpen(false)} classes={{
                paper: "w-[70vw]"
            }}>
                <Menu />
            </MUIDrawer> */}
            <MUIDrawer
                open={openDialog}
                anchor="bottom"
                onClose={() => setOpenDialog(false)}
            >
                <Box className="bg-[#111B21] h-[70vh]">
                    <SquealCreator />
                </Box>
            </MUIDrawer>
            <MUIDrawer
                open={openSearch}
                anchor="top"
                onClose={() => setOpenSearch(false)}
            >
                <Searchbar />
            </MUIDrawer>
        </>
    );
};

export default Navbar;
