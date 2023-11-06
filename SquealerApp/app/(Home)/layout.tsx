export const metadata = {
    title: "Squealer",
    description: "Generated by Next.js",
};

import Header from "@/components/Header";
import Navbar from "@/components/Navbar/Navbar";
import LayoutWrapper from "@/components/LayoutWrapper";
import Menu from "@/components/Navbar/Menu";

import "styles/globals.css";

export default function GeneralLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="md:grid md:grid-cols-4 xl:grid-cols-12">
                <div className="hidden md:block md:h-screen md:z-[1001] md:sticky md:top-0 md:col-span-1 xl:col-span-2">
                    <Menu />
                </div>
                <main className="md:col-span-3 xl:col-span-10">
                    <Header />
                    <LayoutWrapper>{children}</LayoutWrapper>
                </main>
            </div>
            <Navbar />
        </>
    );
}
