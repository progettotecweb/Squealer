"use client";

import CustomLink from "@/components/CustomLink";
import PageContainer from "@/components/PageContainer";
import {signIn} from "next-auth/react"
import { useState } from "react";

const LoginPage = () => {
    
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const requestLogin = async (e) => {
        e.preventDefault()
        
        signIn("username-login", {
            username, password, callbackUrl: "/Home"
        })
    };
    
    
    return (
        <PageContainer className="h-[calc(100vh-10rem)] flex items-center justify-center">
            <h1>Welcome to Squealer!</h1>

            <form className="flex flex-col gap-2">
                <input className="text-slate-800" id="Username" type="text" name="Username" placeholder="Username" onChange={(e) => setUsername(e.target.value)}/>
                <input className="text-slate-800" id="Password" type="password" name="Password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                <button className="px-4 py-2 border rounded" onClick={requestLogin}>Login</button>
            </form>

            <CustomLink href="/Register">Sign up</CustomLink>
            <CustomLink href="/">Log in as guest</CustomLink>

        </PageContainer>
    )
}

export default LoginPage