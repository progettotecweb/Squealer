import React from "react";
import Link from "next/link";

// #TODO-gianlo: change font, add logo maybe?
const Header: React.FC = () => {
  return (
    <header className="flex justify-center items-center bg-slate-700 border-solid border-b-2 fixed  w-full text-center text-stone-50 h-16">
      <Link href="/" className=" text-2xl">SQUEALER</Link>
    </header>
  );
};

export default Header;
