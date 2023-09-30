import React from "react";
import Link from "next/link";

// #TODO-gianlo: change font, add logo maybe?
const Header: React.FC = () => {
    return (
        <header className=" z-[1000] flex justify-center items-center bg-[#111B21] sticky top-0  w-full text-center text-stone-50 h-16">
            <Link href="/" className=" text-2xl">
                SQUEALER
            </Link>
        </header>
    );
};

export default Header;
