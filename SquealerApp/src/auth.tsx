import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const signOut = async () => {
    await fetch("/Home/api/auth/signout?callbackUrl=/Login", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: await fetch("/Home/api/auth/csrf").then((rs) => rs.text()),
    }).then((res) => {
        res.ok
            ? (window.location.href = "/Login")
            : console.error("Error while signing out!");
    });
};

const authOptions: NextAuthOptions = {
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
                    "http://localhost:8000/api/user-login",
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

export { signOut }

export default authOptions;
