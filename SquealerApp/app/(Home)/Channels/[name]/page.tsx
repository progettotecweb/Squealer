"use client";

import CustomLink from "@/components/CustomLink";
import PageContainer from "@/components/PageContainer";
import Squeal, { SquealSkeleton } from "@/components/Squeal/Squeal";
import { useSession } from "next-auth/react";
import useSWR, { Fetcher } from "swr";
import Skeleton from "@mui/material/Skeleton/Skeleton";

import { motion, AnimatePresence } from "framer-motion";

interface Result {
    name: string;
    description: string;
    _id: string;
    squeals: any[];
    official: boolean;
    banner: { mimetype: string; blob: string };
    followers: string[];
    error?: string;
    administrators: string[];
    owner_id?: string;
}

export default function Page({ params }: { params: { name: string } }) {
    const fetcher: Fetcher<Result, string> = (...args) =>
        fetch(...args)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if (res.error) throw new Error(res.error);
                return res;
            });

    const { data, isLoading, mutate, error } = useSWR(
        `/api/channels/${params.name}`,
        fetcher
    );

    const followOrUnfollow = async (
        isFollowing: boolean,
        userid: string,
        channelid: string
    ) => {
        await fetch(`/api/channels/${isFollowing ? "unfollow" : "follow"}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ channelID: channelid, userID: userid }),
        })
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                mutate();
                mutateUser();
            });
    };

    const { data: session, status } = useSession();

    const { data: user, mutate: mutateUser } = useSWR(
        session ? `/api/users/${session?.user?.id}` : null
    );

    if (error)
        return (
            <PageContainer className="p-2" key="error">
                <p>{error.message}</p>
                <CustomLink href="/Channels">Go back</CustomLink>
            </PageContainer>
        );

    return (
        <PageContainer className="p-2" key="channel-page">
            <div className="flex flex-col items-center mb-16">
                <section className="flex flex-col relative h-[15rem] w-full">
                    {data?.banner.mimetype ? (
                        <img
                            src={`data:${data.banner.mimetype};base64,${data.banner.blob}`}
                            alt=""
                            className="w-full h-full rounded-t-md object-cover bg-slate-400"
                        />
                    ) : (
                        <div className="w-full h-full rounded-t-md object-cover bg-slate-400"></div>
                    )}

                    <div className="absolute bottom-0 m-4 rounded-md text-lg flex flex-row gap-2">
                        {data?.owner_id === user?._id && (
                            <div className="px-4 py-1 rounded-lg bg-gray-500 flex items-center shadow-neutral-600 shadow-md">
                                <span>👑 Owner</span>
                            </div>
                        )}
                        <div className="px-4 py-1 rounded-lg bg-gray-500 flex items-center shadow-neutral-600 shadow-md">
                            {data?.official ? (
                                <>
                                    <img
                                        src="/squealer.png"
                                        alt="logo"
                                        className="rounded-full w-10 mr-2"
                                    />
                                    <span>Official channel</span>
                                </>
                            ) : (
                                <span>Custom channel</span>
                            )}
                        </div>
                    </div>
                    {(data?.owner_id === user?._id ||
                        data?.administrators.includes(user?._id)) && (
                        <div className="absolute right-0 bottom-0 m-4 rounded-md text-lg flex flex-row gap-2">
                            <CustomLink
                                className="px-4 py-1 rounded-lg bg-gray-500 flex items-center shadow-neutral-600 shadow-md hover:bg-gray-600 hover:shadow-neutral-700 transition-colors"
                                href={`/Channels/${data?.name}/Edit`}
                            >
                                Edit
                            </CustomLink>
                        </div>
                    )}
                </section>
                <div className="w-full sticky top-16 z-[200] flex-col drop-shadow-xl divide-red-100" onClick={() => window.scroll(0, 0)}>
                    <AnimatePresence mode="wait">
                        {data ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-2 justify-start items-center p-4  bg-gray-800 rounded-b-md w-full"
                                key="data"
                            >
                                <div className="flex flex-col gap-2">
                                    <h1 className="flex flex-col sm:flex-row gap-2 text-3xl items-start sm:items-center ">
                                        §{data.name}
                                        <span className="hidden sm:block">
                                            |
                                        </span>
                                        <span className="text-xl text-gray-400">
                                            {data.description}
                                        </span>
                                    </h1>
                                    <div className="flex gap-1">
                                        <div className="flex items-center gap-1">
                                            {data?.followers?.length}{" "}
                                            <span className="text-gray-400">
                                                followers
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {data?.squeals?.length}{" "}
                                            <span className="text-gray-400">
                                                squeals
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {session && session?.user && (
                                    <button
                                        onClick={() =>
                                            followOrUnfollow(
                                                user.following.includes(
                                                    data._id
                                                ),
                                                session?.user.id,
                                                data._id
                                            )
                                        }
                                        className="rounded-md px-4 py-1 bg-gray-700 hover:bg-gray-600 transition-colors ml-auto"
                                    >
                                        {!user?.following.includes(data._id)
                                            ? "Follow"
                                            : "Unfollow"}
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col gap-2 justify-start items-start p-4 md:w-[70vw] bg-gray-800 rounded-md"
                                key="data-loading"
                            >
                                <Skeleton
                                    variant="text"
                                    width="100%"
                                    height={50}
                                />
                                <Skeleton
                                    variant="text"
                                    width="100%"
                                    height={50}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <AnimatePresence mode="wait">
                    {data ? (
                        <motion.section
                            className="mt-2 flex flex-col gap-2 w-full md:w-[60vw] justify-center items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key="data"
                        >
                            {data?.squeals.map((squeal, index) => {
                                return (
                                    <Squeal
                                        id={squeal._id}
                                        reactions={squeal.reactions}
                                        squealData={squeal}
                                        type={squeal.type}
                                        key={index}
                                        content={squeal.content}
                                        owner={squeal?.ownerID}
                                        date={squeal?.datetime}
                                        className="w-full"
                                    />
                                );
                            })}
                        </motion.section>
                    ) : (
                        <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key="data-loading"
                            className="mt-2 flex flex-col gap-2 w-full md:w-[60vw]"
                        >
                            {[1, 2, 3, 4, 5, 6, 7].map((_, index) => {
                                return <SquealSkeleton key={index} />;
                            })}
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
            
        </PageContainer>
    );
}
