//components
"use client";
import SquealCreator from "@/components/Navbar/SquealCreator";
import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import Squeal, { SquealSkeleton } from "@/components/Squeal/Squeal";
import Tabs, { Tab } from "@/components/Tabs/Tabs";
import { AnimatePresence, motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";

//fade in fade out
const variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
    },
    exit: {
        opacity: 0,
    },
};

const Homepage = () => {
    const { data: session, status } = useSession();
    const contentFinished = useRef<boolean>(false);

    const getKey = (pageIndex: any, previousPageData: string | any[]) => {
        if (previousPageData && !previousPageData.length) {
            contentFinished.current = true;
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
                    contentFinished.current = true;
                }

                return data;
            });

    const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
        getKey,
        fetcher
    );

    const searchParams = useSearchParams();

    useEffect(() => {
        const handleScroll = (e) => {
            const scrollHeight = e.target.documentElement.scrollHeight;
            const currentHeight =
                e.target.documentElement.scrollTop + window.innerHeight;
            if (currentHeight + 1 >= scrollHeight && !contentFinished.current) {
                //console.log(`Requesting next page (${contentFinished.current ? "finished" : "not finished"})`)
                setSize(size + 1);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getKeyForFiltered = (
        pageIndex: any,
        previousPageData: string | any[]
    ) => {
        if (previousPageData && !previousPageData.length) {
            contentFinished.current = true;
            return null;
        } // reached the end

        return searchParams?.has("q")
            ? `/api/squeals/filter?q=${encodeURIComponent(
                  searchParams?.get("q") as string
              )}&page=${pageIndex}&limit=10`
            : null; // SWR key
    };

    const {
        data: filteredData,
        size: filteredSize,
        setSize: setFilteredSize,
        isLoading: filteredIsLoading,
        isValidating: filteredIsValidating,
    } = useSWRInfinite(getKeyForFiltered, fetcher);

    return (
        <PageContainer key="home">
            <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw] mb-16">
                {session && session.user && (
                    <div className="hidden md:block">
                        <SquealCreator />
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {searchParams?.has("q") ? (
                        filteredData &&
                        filteredData?.length > 0 && (
                            <motion.div
                                variants={variants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                key="search"
                                className="flex flex-col w-full gap-2"
                            >
                                {filteredData &&
                                    filteredData.map((page) => {
                                        return page?.map((squeal, index) => (
                                            <Squeal
                                                squealData={squeal}
                                                type={squeal.type}
                                                key={index}
                                                id={squeal._id}
                                                content={squeal.content}
                                                owner={squeal?.ownerID}
                                                date={squeal?.datetime}
                                                reactions={squeal?.reactions}
                                                recipients={squeal?.recipients}
                                            />
                                        ));
                                    })}
                            </motion.div>
                        )
                    ) : (
                        <motion.div
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            key="feed"
                        >
                            <section className="flex flex-col gap-2 w-full">
                                {data
                                    ? data.map((page) => {
                                          return page?.map((squeal, index) => (
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
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </PageContainer>
    );
};

export default Homepage;
