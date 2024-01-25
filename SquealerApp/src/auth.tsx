import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/Home/Login",
        error: "/Home/Login?error=",
    },

    callbacks: {
        async jwt({ token, user, trigger }) {
            // the processing of JWT occurs before handling sessions.
            if (trigger === "update") {
                const updatedUser = await fetch(`${process.env.BASE_URL}/api/users/${token.id}`)
                const updatedUserData = await updatedUser.json()

                token.role = updatedUserData.role;
                token.id = updatedUserData._id;
                token.name = updatedUserData.name;

                return token;
            }

            if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.accessTokenExpires = user.accessTokenExpires;
                token.role = user.role;
                token.id = user.id;
                token.name = user.name;
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
                    name: token.name,
                },
                error: token.error,
            };
        },
    },

    providers: [
        CredentialsProvider({
            id: "login",
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
                if (!credentials?.username || !credentials.password) {
                    return null;
                }

                const authResponse = await fetch(
                    "http://localhost:8000/api/users/login",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(credentials),
                    }
                );

                if (!authResponse.ok) {
                    return null;
                }

                const user = authResponse.json();

                return user;
            },
        }),
    ],
};

export default authOptions;
