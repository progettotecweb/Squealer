export const metadata = {
    title: "Squealer",
    description: "Twitter is dead, and we have killed it!",
};

import "styles/globals.css";

import NextAuthProvider from "@/components/Auth/NextAuthProvider";
import dynamic from "next/dynamic";

const ServiceRegister = dynamic(
    () => import("@/components/PushNotifications/ServiceRegister"),
    {
        ssr: false,
    }
);

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#111b21" />
                <meta
                    key="keywords"
                    name="keywords"
                    content={'Squealer, Social Media, Social Network'}
                />
                <meta
                    key="description"
                    name="description"
                    content="Twitter is dead, and we have killed it!"
                />
                <meta key="og-title" property="og:title" content="Squealer" />
                <meta
                    key="og-description"
                    property="og:description"
                    content="Twitter is dead, and we have killed it!"
                />
                <meta property="og:image" content="/squealer.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Logo" />
                <meta property="og:type" content="website" />

                <meta
                    key="og-url"
                    property="og:url"
                    content={'https://site222303.tw.cs.unibo.it'}
                />
                <meta
                    key="twitter-title"
                    name="twitter:title"
                    content="Squealer"
                />
                <meta
                    key="twitter-description"
                    name="twitter:description"
                    content="Twitter is dead, and we have killed it!"
                />
                <meta name="twitter:site" content="@squealer" />
            </head>
            <body>
                <NextAuthProvider>
                    <ServiceRegister />
                    {children}
                </NextAuthProvider>
            </body>
        </html>
    );
}
