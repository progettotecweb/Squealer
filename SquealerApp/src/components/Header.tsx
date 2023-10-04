import React from "react";
import Link from "next/link";
import Image from "next/image";

// #TODO-gianlo: change font, add logo maybe?
const Header: React.FC = () => {
    return (
        <header className=" z-[1000] flex justify-center flex-column items-center bg-[#111B21] sticky top-0  w-full text-center text-stone-50 h-16">
            <Link href="/" className=" text-2xl flex justify-center items-center">
                <Image src="/squealer.png" width={50} height={50} alt="logo"/>
                SQUEALER
            </Link>
        </header>
    );
};

export default Header;
