"use client";

import { useState } from "react";

import SearchIcon from "@/icons/SearchIcon";
import IconAccountCircle from "@/icons/AccountIcon";
import IconAdd from "@/icons/AddIcon";

import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";

import CustomIcon from "@/components/CustomIcon";
import Menu from "@/components/Navbar/Menu";
import SquealCreator from "@/components/Navbar/SquealCreator";
import Searchbar from "@/components/Navbar/Searchbar";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);

    return (
        <>
            <nav className="fixed bottom-0 h-16 bg-[#111B21] w-full flex justify-evenly items-center md:hidden">
                <CustomIcon
                    icon={<SearchIcon className="h-8 w-8 text-slate-50" />}
                    onClick={() => setOpenSearch(!openSearch)}
                />
                <CustomIcon
                    icon={<IconAdd className="h-8 w-8 text-slate-50" />}
                    onClick={() => setOpenDialog(!openDialog)}
                />
                <CustomIcon
                    icon={
                        <IconAccountCircle className="h-8 w-8 text-slate-50" />
                    }
                    onClick={() => setOpen(!open)}
                />
            </nav>
            <SwipeableDrawer
                anchor="left"
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <Menu setOpen={setOpen} />
            </SwipeableDrawer>
            <SwipeableDrawer
                open={openDialog}
                anchor="bottom"
                onOpen={() => setOpenDialog(true)}
                onClose={() => setOpenDialog(false)}
            >
                <Box className="bg-[#111B21] h-[70vh] rounded-lg">
                    <SquealCreator setOpenDialog={setOpenDialog} />
                </Box>
            </SwipeableDrawer>
            <SwipeableDrawer
                open={openSearch}
                anchor="top"
                onOpen={() => setOpenSearch(true)}
                onClose={() => setOpenSearch(false)}
            >
                <Box className="bg-[#111B21] text-slate-50 flex flex-column">
                    <Searchbar />
                </Box>
            </SwipeableDrawer>
        </>
    );
};

export default Navbar;
