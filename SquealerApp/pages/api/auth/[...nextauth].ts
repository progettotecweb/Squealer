import NextAuth from "next-auth";


import authOptions from "@/auth";


const handler = NextAuth(authOptions);

export default handler;