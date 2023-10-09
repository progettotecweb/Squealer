"use client";

import CustomLink from "@/components/CustomLink";
import PageContainer from "@/components/PageContainer";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const requestLogin = async (e) => {
        e.preventDefault();

        await signIn("login", {
            username,
            password,
            redirect: false,
        }).then((data) => {
            data?.error ? setError("Credentials do not match!") : router.push("/");
        });
    };

    const { data: session } = useSession();
    useEffect(() => {
        if (session) {
            router.push("/");
        }
    }, [session])

    return (
        <PageContainer className="h-[calc(100vh-10rem)] flex items-center justify-center">
            <h1>Welcome to Squealer!</h1>

            <form className="flex flex-col gap-2">
                <input
                    className="text-slate-800"
                    id="Username"
                    type="text"
                    name="Username"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="text-slate-800"
                    id="Password"
                    type="password"
                    name="Password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="px-4 py-2 border rounded"
                    onClick={requestLogin}
                >
                    Login
                </button>
            </form>
            
            <CustomLink href="/Register">Sign up</CustomLink>
            <CustomLink href="/">Log in as guest</CustomLink>

            <AnimatePresence mode="wait">
                {error && <motion.h1
                    className="text-red-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {error}
                </motion.h1>}
            </AnimatePresence>
        </PageContainer>
    );
};

export default LoginPage;
