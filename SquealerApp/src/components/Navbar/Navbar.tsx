"use client";

import { useState } from "react";

import SearchIcon from "@/icons/SearchIcon";
import IconAccountCircle from "@/icons/AccountIcon";
import IconAdd from "@/icons/AddIcon";

import Box from "@mui/material/Box";

import CustomIcon from "@/components/CustomIcon";
import Menu from "@/components/Navbar/Menu";
import SquealCreator from "@/components/Navbar/SquealCreator";
import Searchbar from "@/components/Navbar/Searchbar";
import Drawer from "@/components/Drawer/Drawer";
import { useUser } from "@/hooks/useUser";
import { Drawer as MUIDrawer } from "@mui/material";

const Navbar = () => {
    const {user} = useUser();

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

            
            {/*<Drawer open={open} anchor="left" onClose={() => setOpen(false)}>
                <Menu user={user}/>
            </Drawer>*/}
            <MUIDrawer
                anchor="left"
                open={open}
                onClose={() => setOpen(false)}
            >
                <Menu onOpen={() => setOpen(false)} />
            </MUIDrawer>
            <Drawer
                open={openDialog}
                anchor="bottom"
                onClose={() => setOpenDialog(false)}
            >
                <Box className="bg-[#111B21] h-[70vh] rounded-lg">
                    <SquealCreator />
                </Box>
            </Drawer>
            <Drawer
                open={openSearch}
                anchor="top"
                onClose={() => setOpenSearch(false)}
            >
                <Searchbar />
            </Drawer>
        </>
    );
};

export default Navbar;
