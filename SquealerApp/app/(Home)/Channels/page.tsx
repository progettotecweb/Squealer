"use client";

import CustomLink from "@/components/CustomLink";
import PageContainer from "@/components/PageContainer";
import { useSession } from "next-auth/react";
import useSWR, { Fetcher } from "swr";

interface ChannelProps {
    name: string;
    description: string;
    id: string;
    session: any;
}

const ChannelCard = ({ name, description, id, session }: ChannelProps) => {
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
            });
    };

    const {
        data: user,
        isLoading,
        mutate,
    } = useSWR(`/api/users/${session?.user?.id}`);
    if (!isLoading)
        return (
            <div className="w-full rounded-md flex flex-col gap-4 justify-start items-start p-3 bg-gray-800">
                <CustomLink href={`/Channels/${name}`} className="text-xl">§{name}</CustomLink>
                <p className="flex-1">{description}</p>
                {user && <button
                    onClick={() =>
                        followOrUnfollow(
                            user.following.includes(id),
                            session?.user.id,
                            id
                        )
                    }
                    className="rounded-md px-4 py-1 bg-gray-700 hover:bg-gray-600 transition-colors self-end"
                >
                    {!user.following.includes(id) ? "Follow" : "Unfollow"}
                </button>}
            </div>
        );
};

const ChannelsPage = () => {
    interface SearchResults {
        results: any[];
    }

    const fetcher: Fetcher<SearchResults, string> = (...args) =>
        fetch(...args).then((res) => res.json());

    const { data, isLoading, mutate, error } = useSWR<SearchResults>(
        "/api/channels",
        fetcher
    );

    const { data: session, status } = useSession();

    if (isLoading || status === "loading")
        return (
            <div
                key="settings"
                className="text-gray-50 flex w-full items-center justify-center"
            >
                <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                >
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                    </span>
                </div>
            </div>
        );

    return (
        <PageContainer key="settings" className="p-2 ">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 w-full sm:w-[80%] mb-16">
                {data?.results.map((result, i) => {
                    return (
                        <ChannelCard
                            key={i}
                            name={result.name}
                            description={result.description}
                            id={result._id}
                            session={session}
                        />
                    );
                })}
            </div>
        </PageContainer>
    );
};

export default ChannelsPage;
