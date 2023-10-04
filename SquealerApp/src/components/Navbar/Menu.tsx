import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";

import CustomLink from "@/components/CustomLink";
import Image from "next/image";

interface MenuProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Menu: React.FC<MenuProps> = ({ setOpen }) => {
    return (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={() => setOpen(false)}
            onKeyDown={() => setOpen(false)}
            className="bg-slate-800 text-slate-50 h-screen p-4 flex flex-col"
        >
            <Image
                src="/img/squealer.png"
                alt="Squealer"
                height={150}
                width={150}
                className="m-auto"
            />
            <h1>Full name</h1>
            <h2>@username</h2>
            <Divider light />

            <Container className="flex flex-col flex-1 mt-2">
                {["Settings", "Account", "etc."].map((text, index) => (
                    <CustomLink href={`/${text}`} key={index} className="mt-2">
                        {text}
                    </CustomLink>
                ))}
            </Container>
            <Divider light />
            <Container className="flex flex-col mt-auto">
                <CustomLink type="a" href="/SMM" className="mt-2">
                    Switch to SMM
                </CustomLink>
                <CustomLink type="a" href="/Moderator" className="mt-2">
                    Switch to Moderator
                </CustomLink>
            </Container>
        </Box>
    );
};

export default Menu;
