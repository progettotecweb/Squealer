"use client";

import CustomLink from "@/components/CustomLink";
import PageContainer from "@/components/PageContainer";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@mui/material";
import { useRouter } from "next/navigation";
import Divider from "@/components/Divider";

const InputClassNames = "rounded-md p-2 bg-gray-800 mb-2 w-full";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const requestLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            signIn("login", {
                username,
                password,
                redirect: false,
            })
                .then((data) => {
                    data?.error && setError("Invalid username or password");
                })
                .catch((err) => {
                    setError("Invalid username or password");
                });
        } catch (error) {
            setError(error);
        } finally {
            //router.push("/");
        }
    };

    const { data: session, status } = useSession();
    useEffect(() => {
        if (status === "authenticated") {
            redirect("/");
        }
    }, [status]);

    useEffect(() => {
        if (error) {
            setTimeout(() => {
                setError("");
            }, 5000);
        }
    }, [error]);

    return (
        <PageContainer className="h-[100vh]">
            <motion.div className="flex flex-col gap-4">
                <motion.div className="mb-4 flex flex-col items-center" layout animate="height">
                    <img src="/squealer.png" alt="logo" />
                    <motion.h1 className="text-2xl">
                        Welcome to Squealer!
                    </motion.h1>
                </motion.div>

                <motion.form className="flex flex-col gap-2" name="login-form" layout >
                    <input
                        className={InputClassNames}
                        id="Username"
                        type="text"
                        name="Username"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className={InputClassNames}
                        id="Password"
                        type="password"
                        name="Password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="flex w-full justify-stretch *:flex-1 gap-4">
                        <button
                            className="py-2 px-8 bg-blue-700 hover:bg-blue-800 rounded-md transition-colors"
                            onClick={requestLogin}
                        >
                            Login
                        </button>
                    </div>
                </motion.form>

                <AnimatePresence mode="popLayout">
                    {error && (
                        <motion.h1
                            className="text-red-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {error}
                        </motion.h1>
                    )}
                </AnimatePresence>

                <motion.div className="flex flex-row items-center gap-2" layout>
                    <Divider className="flex-1" />
                    <p>Or</p>
                    <Divider className="flex-1" />
                </motion.div>

                <motion.section className="flex flex-col gap-4" layout>
                    <CustomLink
                        href="/"
                        className=" bg-gray-700 rounded-md grid place-content-center hover:bg-gray-800 transition-colors"
                        innerClassName="py-2 px-8  "
                    >
                        Log in as guest
                    </CustomLink>

                    <CustomLink
                        href="/Lost"
                        className=" bg-gray-700 rounded-md grid place-content-center hover:bg-gray-800 transition-colors"
                        innerClassName="py-2 px-8  "
                    >
                        Forgot your password?
                    </CustomLink>
                </motion.section>

                <motion.div className="flex flex-row items-center gap-2" layout>
                    <Divider className="flex-1" />
                    <h2 className="text-lg">Don't have an account?</h2>
                    <Divider className="flex-1" />
                </motion.div>

                <motion.section className="flex flex-col gap-4" layout>
                    
                    <CustomLink
                        href="/Register"
                        className=" bg-gray-700 rounded-md grid place-content-center hover:bg-gray-800 transition-colors"
                        innerClassName="py-2 px-8  "
                    >
                        Sign up!
                    </CustomLink>
                </motion.section>

                
            </motion.div>
        </PageContainer>
    );
};

export default LoginPage;
