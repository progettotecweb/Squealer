"use client";

import CustomLink from "@/components/CustomLink";
import { signOut } from "next-auth/react";

const LoginOrSignUp = ({user}) => {
    return (
        <>
            {user ? (
                <button onClick={() => signOut({ callbackUrl: "/Home/Login" })}>
                    Sign Out
                </button>
            ) : (
                <CustomLink href="/Login">Sign In</CustomLink>
            )}
        </>
    );
};

export default LoginOrSignUp;