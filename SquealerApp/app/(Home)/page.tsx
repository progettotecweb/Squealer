//components
"use client";
import SquealCreator from "@/components/Navbar/SquealCreator";
import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import Squeal, { SquealSkeleton } from "@/components/Squeal/Squeal";
import Tabs, { Tab } from "@/components/Tabs/Tabs";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSWRInfinite from "swr/infinite";

const Homepage = () => {
    const { data: session, status } = useSession();
    const [contentFinished, setContentFinished] = useState(false);

    const getKey = (pageIndex: any, previousPageData: string | any[]) => {
        if (previousPageData && !previousPageData.length) {
            setContentFinished(true);
            return null;
        } // reached the end
        return status === "authenticated"
            ? `/api/users/${session?.user?.id}/feed?page=${pageIndex}&limit=10`
            : status === "unauthenticated"
            ? "/api/globalFeed"
            : null; // SWR key
    };

    const fetcher = (url: string) =>
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.length === 0) {
                    setContentFinished(true);
                }

                return data;
            });

    const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
        getKey,
        fetcher
    );

    useEffect(() => {
        const handleScroll = (e) => {
            const scrollHeight = e.target.documentElement.scrollHeight;
            const currentHeight =
                e.target.documentElement.scrollTop + window.innerHeight;
            if (currentHeight + 1 >= scrollHeight && !contentFinished) {
                setSize(size + 1);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <PageContainer key="home">
            <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw]">
                {session && session.user && (
                    <div className="hidden md:block">
                        <SquealCreator />
                    </div>
                )}
                <Tabs>
                    <Tab
                        label="Global"
                        content={
                            <section className="flex flex-col gap-2 w-full">
                                {data
                                    ? data.map((page) => {
                                          return page.map((squeal, index) => (
                                              <Squeal
                                                  squealData={squeal}
                                                  type={squeal.type}
                                                  key={index}
                                                  id={squeal._id}
                                                  content={squeal.content}
                                                  owner={squeal?.ownerID}
                                                  date={squeal?.datetime}
                                                  reactions={squeal?.reactions}
                                                  recipients={
                                                      squeal?.recipients
                                                  }
                                              />
                                          ));
                                      })
                                    : [1, 2, 3, 4, 5, 6, 7].map((_, index) => (
                                          <div key={index}>
                                              <SquealSkeleton />
                                          </div>
                                      ))}
                                {isValidating || (isLoading && <Spinner />)}
                                {!contentFinished ? (
                                    <button onClick={() => setSize(size + 1)}>
                                        Load More
                                    </button>
                                ) : (
                                    <div>finished</div>
                                )}
                            </section>
                        }
                    />
                    <Tab label="§RANDOM" content={<div>random</div>} />
                </Tabs>
            </section>
        </PageContainer>
    );
};

export default Homepage;
