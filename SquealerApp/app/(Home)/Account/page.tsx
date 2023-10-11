"use client";

import PageContainer from "@/components/PageContainer";
import { useSession } from "next-auth/react";

const AccountPage = () => {
    const { data: session } = useSession();
    
    return (
        <PageContainer key="account">
            <h1>Account Page</h1>


            {session && session.user && <pre className="text-left">{JSON.stringify(session.user, null, 2)}</pre>}
        </PageContainer>
    );
};

export default AccountPage;
