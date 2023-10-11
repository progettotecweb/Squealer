//components
"use client";
import SquealCreator from "@/components/Navbar/SquealCreator";
import PageContainer from "@/components/PageContainer";
import Squeal from "@/components/Squeal/Squeal";
import { useSession } from "next-auth/react";

const squeals = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

const Homepage = () => {

    const {data : session} = useSession();

    return (
        <PageContainer key="home">
            <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw]">
                {session && session.user && <div className="hidden md:block">
                    <SquealCreator />
                </div>}
                {squeals.map((squeal, index) => (
                    <Squeal key={index} />
                ))}
            </section>
        </PageContainer>
    );
};

export default Homepage;
