//components
"use client";
import SquealCreator from "@/components/Navbar/SquealCreator";
import PageContainer from "@/components/PageContainer";
import Squeal from "@/components/Squeal/Squeal";
import { useSession } from "next-auth/react";
import useSWR, { Fetcher } from "swr";

const squeals = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

const Homepage = () => {

    const {data : session} = useSession();

    interface Squeal {
        content: string;
        userInfo: {
            name: string;
        }
        datetime: Date,
    }

    interface Res {
        results: Squeal[]
    }

    const fetcher: Fetcher<Res, string> = (...args) => fetch(...args).then((res) => res.json());

    const {data, isLoading, error} = useSWR<Res>(() => session ? `/api/squeals/${session?.user.id}` : null, fetcher);

    return (
        <PageContainer key="home">
            <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw]">
                {session && session.user && <div className="hidden md:block">
                    <SquealCreator />
                </div>}
                {
                    isLoading && <div>Loading...</div>
                } {
                    data && data.results.map((squeal, index )=> {
                        return <Squeal key={index}  content={squeal.content} name={squeal?.userInfo?.name} date={squeal?.datetime}/>
                    })
                }
            </section>
        </PageContainer>
    );
};

export default Homepage;
