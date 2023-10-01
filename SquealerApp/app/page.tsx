import React from "react";

//components
import PageContainer from "@/components/PageContainer";
import Squeal from "@/components/Squeal/Squeal";

const squeals = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

const Homepage: React.FC = async () => {
    return (
        <PageContainer key="home">
            <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw]">
                {squeals.map((squeal, index) => (
                    <Squeal key={index} />
                ))}
            </section>
        </PageContainer>
    );
};

export default Homepage;
