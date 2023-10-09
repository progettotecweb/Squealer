"use client";

import Box from "@mui/material/Box";
import Divider from "@/components/Divider";
import Container from "@mui/material/Container";

import CustomLink from "@/components/CustomLink";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

interface MenuProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Menu: React.FC<MenuProps> = ({ setOpen }) => {

    const {data : session } = useSession()

    return (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={() => setOpen(false)}
            onKeyDown={() => setOpen(false)}
            className="bg-slate-800 text-slate-50 h-full p-2 flex flex-col"
        >
            <Image
                src="/squealer.png"
                alt="Squealer"
                height={150}
                width={150}
                className="m-auto"
            />

            <section className="m-3">
                <h1>
                    {session && session.user ? "@" + session.user.name : "Welcome guest!"}
                </h1>
                {session && session.user ? <button onClick={() => signOut({callbackUrl: "/Home/Login"})}>
                    Sign Out
                </button> : <CustomLink href="/Login">Sign In</CustomLink>}
            </section>
            <Divider />

            <section className="m-3">
                <pre>Daily: 987/1000</pre>
                <pre>Weekly: 4768/6000</pre>
                <pre>Monthly: 12389/24000</pre>
            </section>

            <Divider />

            <Container className="flex flex-col flex-1">
                {["Channels", "Settings", "Account", "Shop"].map(
                    (text, index) => (
                        <CustomLink
                            href={`/${text}`}
                            key={index}
                            className="mt-3 text-xl"
                        >
                            {text}
                        </CustomLink>
                    )
                )}
            </Container>
            <Divider />
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
