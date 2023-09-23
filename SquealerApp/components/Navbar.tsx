import SearchIcon from "../icons/SearchIcon";
import IconAccountCircle from "../icons/AccountIcon";
import IconAdd from "../icons/AddIcon";
import { SwipeableDrawer, Box, Divider, Container } from "@mui/material";

import CustomIcon from "./CustomIcon";
import { useState } from "react";
import  Link  from "next/link";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const Menu = () => {
    return (
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={() => setOpen(false)}
        onKeyDown={() => setOpen(false)}
        className="bg-slate-800 text-slate-50 h-full p-4"
      >
        <h1>Full name</h1>
        <h2>@username</h2>
        <Divider light />

        <Container className="flex flex-col justify-center h-full">
          {["Settings", "Account", "etc."].map((text, index) => (
            <div className=" my-4" key={index}>
              <Link href={`/${text}`}>{text}</Link>
            </div>
          ))}
        </Container>
        <Divider light />
      </Box>
    );
  };

  return (
    <nav className="fixed bottom-0 h-16 bg-slate-700 border-solid border-t-2 w-full flex justify-evenly items-center">
      <CustomIcon icon={<SearchIcon className="h-8 w-8 text-slate-50" />} />
      <CustomIcon icon={<IconAdd className="h-8 w-8 text-slate-50" />} />
      <CustomIcon
        icon={<IconAccountCircle className="h-8 w-8 text-slate-50" />}
        onClick={() => setOpen(!open)}
      />
      <SwipeableDrawer
        anchor="left"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <Menu />
      </SwipeableDrawer>
    </nav>
  );
};

export default Navbar;
