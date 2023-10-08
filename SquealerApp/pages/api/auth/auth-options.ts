import { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/Home/Login",
    },

    callbacks: {
        async jwt({ token, user, session }) {
            // the processing of JWT occurs before handling sessions.

            if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.accessTokenExpires = user.accessTokenExpires;
                token.role = user.role;
                token.id = user.id;
            }

            return token;
        },

        //  The session receives the token from JWT
        async session({ session, token, user }) {

            return {
                ...session,
                user: {
                    ...session.user,
                    accessToken: token.accessToken as string,
                    refreshToken: token.refreshToken as string,
                    role: token.role,
                    id: token.id,
                },
                error: token.error,
            };
        },
    },

    providers: [
        CredentialsProvider({
            id: "username-login",
            name: "Credentials",
            credentials: {
                username: {
                    label: "username",
                    type: "text",
                    placeholder: "jsmith",
                },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials, req) {

                
                const authResponse = await fetch("http://127.0.0.1:8000/api/user-login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(credentials),
                });

                if (!authResponse.ok) {
                    return null;
                }

                const user = authResponse.json();

                return user;
            },
        }),
    ],
}
