"use client";

import PageContainer from "@/components/PageContainer";

import NotificationMenu from "@/components/Navbar/NotificationMenu";

const NotificationsMobilePage = () => {
    return (
        <PageContainer className="w-full flex justify-start p-2">
            <section className="w-full text-start">
                <NotificationMenu />
            </section>
        </PageContainer>
    );
};

export default NotificationsMobilePage;
