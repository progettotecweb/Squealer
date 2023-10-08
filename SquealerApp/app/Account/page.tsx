"use client";

import PageContainer from "@/components/PageContainer";
import { useSession } from "next-auth/react";

const AccountPage = async () => {
    const { data: session } = useSession();
    
    return (
        <PageContainer key="account">
            <h1>Account Page</h1>

            <h1>{session && session.user && session.user.name}</h1>
            <h1>{session && session.user && session.user.email}</h1>
        </PageContainer>
    );
};

export default AccountPage;
