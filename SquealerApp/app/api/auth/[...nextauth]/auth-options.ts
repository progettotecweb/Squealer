import { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },

    pages: {
        //signIn: "/Home/Login",
        signOut: "/auth/signout",
        error: "/auth/error", // Error code passed in query string as ?error=
        verifyRequest: "/auth/verify-request", // (used for check email message)
        newUser: null, // If set, new users will be directed here on first sign in
    },

    callbacks: {
        async jwt({ token, user, session }) {
            // the processing of JWT occurs before handling sessions.
            console.log("jwt callback ", { token, user, session });

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
            console.log("session callback ", { token, user, session });

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
                console.log("authorize callback ", { credentials });

                
                const authResponse = await fetch("/api/user-login", {
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
                console.log("User: " + user);

                return user;
            },
        }),
    ],
}
