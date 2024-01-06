"use client";

import CustomLink from "@/components/CustomLink";
import PageContainer from "@/components/PageContainer";
import useSWR, { Fetcher } from "swr";

interface ChannelProps {
    name: string;
    description: string;
    id: string;
}

const followChannel = async (id: string) => {
    const userData = await fetch("/Home/api/user", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());
    const res = await fetch("/api/channels/follow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelID: id, userID: userData.id }),
    });

    console.log(res);
};

const ChannelCard = ({ name, description, id }: ChannelProps) => {
    return (
        <div className="w-full border rounded-md flex flex-col gap-2 justify-start items-start p-2">
            <CustomLink href={`/Channels/${name}`}>{name}</CustomLink>
            <p>{description}</p>
            <button
                onClick={() => followChannel(id)}
                className="border rounded-md p-2"
            >
                Follow
            </button>
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

    if (isLoading)
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
        <PageContainer key="settings">
            <h1>Channels</h1>

            <div className="flex flex-col w-[80%]">
                {data?.results.map((result, i) => {
                    return (
                        <ChannelCard
                            key={i}
                            name={result.name}
                            description={result.description}
                            id={result._id}
                        />
                    );
                })}
            </div>
        </PageContainer>
    );
};

export default ChannelsPage;
