"use client";

import CustomLink from "@/components/CustomLink";
import PageContainer from "@/components/PageContainer";
import Squeal from "@/components/Squeal/Squeal";
import useSWR, { Fetcher } from "swr";

interface Result {
    name: string;
    description: string;
    id: string;
    squeals: any[];
}

export default function Page({ params }: { params: { name: string } }) {
    const fetcher: Fetcher<Result, string> = (...args) =>
        fetch(...args).then((res) => {
            if (!res.ok) {
                const error = new Error(
                    "Ooops! Looks like this channel doesn't exist."
                );
                throw error;
            }
            return res.json();
        });

    const { data, isLoading, mutate, error } = useSWR(
        `/api/channels/${params.name}`,
        fetcher
    );

    return (
        <PageContainer>
            {error && (
                <>
                    <p>{error.message}</p>
                    <CustomLink href="/Channels">Go back</CustomLink>
                </>
            )}
            {data && (
                <div className="flex flex-col gap-2 justify-start items-start p-2 w-[80%]">
                    <h1>§{data.name}</h1>
                    <p>{data.description}</p>
                </div>
            )}

            <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw]">
                {data &&
                    data?.squeals.map((squeal, index) => {
                        return (
                            <Squeal
                                key={index}
                                content={squeal.content}
                                name={squeal?.userInfo?.name}
                                date={squeal?.datetime}
                            />
                        );
                    })}
            </section>
        </PageContainer>
    );
}
