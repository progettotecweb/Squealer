"use client";

import Divider from "@/components/Divider";
import Container from "@mui/material/Container";

import CustomLink from "@/components/CustomLink";
import Image from "next/image";
import {useUser} from "@/hooks/useUser";
import ClientButton from "./ClientButton";

const Menu = () => {
    const {user} = useUser();

    return (
        <div
            role="presentation"
            className="bg-slate-800 text-slate-50 h-full p-2 flex flex-col md:bg-[#111B21]"
        >
            <Image
                src="/squealer.png"
                alt="Squealer"
                height={150}
                width={150}
                className="m-auto w-auto"
                priority
            />

            <section className="m-3">
                <h1>
                    {user
                        ? "@" + user.name
                        : "Welcome guest!"}
                </h1>
                <ClientButton user={user}/>
            </section>
            <Divider />

            {user && <><section className="m-3 flex flex-col gap-2">
                <div>Daily: 987/1000</div>
                <div>Weekly: 4768/6000</div>
                <div>Monthly: 12389/24000</div>
            </section>

            <Divider /></>}

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
                {user && user.role == "Mod" && (
                    <CustomLink
                        type="a"
                        href="/Moderator"
                        className="mt-3 text-xl"
                    >
                        Moderator Dashboard
                    </CustomLink>
                )}
                {user && user.role == "SMM" && (
                    <Container className="flex flex-col mt-auto">
                        <CustomLink
                            type="a"
                            href="/SMM"
                            className="mt-3 text-xl"
                        >
                            SMM Dashboard
                        </CustomLink>
                    </Container>
                )}
            </Container>
            <Divider />
        </div>
    );
};

export default Menu;
