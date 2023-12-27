"use client";

import Divider from "@/components/Divider";
import PageContainer from "@/components/PageContainer";
import Squeal from "@/components/Squeal/Squeal";
import Tabs, { AnimatedTabContent, Tab } from "@/components/Tabs/Tabs";
import { Button } from "@mui/material";
import { useSession } from "next-auth/react";
import Popup from "reactjs-popup";
import useSWR from "swr";

interface Squeal {
    _id: string;
    type: "text" | "image" | "geolocation" | "video";
    content: {
        text: string | null;
        img: {
            mimetype: string;
            blob: string;
        } | null;
        geolocation: {
            latitude: number;
            longitude: number;
        };
        video: {
            mimetype: string;
            blob: string;
        } | null;
    };
    geolocation: string | null;
    ownerID: any;
    datetime: string;
    reactions: any;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const UserCard = ({ session }) => {
    const { data, isLoading } = useSWR(
        `/api/users/${session?.user?.id}`,
        fetcher
    );

    if (isLoading) return <div>Loading...</div>;

    return (
        <section className="w-full md:w-[70vw] rounded-md  bg-slate-700 grid grid-cols-4">
            <div className="flex flex-col items-center justify-center p-4">
                <img
                    src={`data:${data?.img.mimetype};base64,${data?.img.blob}`}
                    alt="Profile Picture"
                    className="w-32 h-32 rounded-full"
                />
                <h1 className="text-2xl font-semibold text-white">
                    @{data?.name}
                </h1>
            </div>
            <section className="col-span-3 p-4 text-2xl flex flex-col">
                <div className="grid grid-cols-3">
                    <h1 className="flex flex-col">
                        {data.squeals.length}
                        <h2>Squeals</h2>
                    </h1>
                    <h1 className="flex flex-col">
                        0<h2>Followers</h2>
                    </h1>
                    <h1 className="flex flex-col">
                        {data.following.length}
                        <h2>Following</h2>
                    </h1>
                </div>
                <div className="self-start">Bio - Descrizione (TODO)</div>
            </section>
        </section>
    );
};

const ScheduledSquealsSection = ({ session }) => {
    const {
        data: scheduledSqueals,
        isLoading: scheduledSquealsLoading,
        mutate: mutateScheduledSqueals,
    } = useSWR(`/api/squeals/cron/${session?.user?.id}`, fetcher);

    if (scheduledSquealsLoading) return <div>Loading...</div>;

    // if(scheduledSqueals.length === 0) return <div>No scheduled squeals</div>

    return (
        <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw]">
            {scheduledSqueals &&
                scheduledSqueals.map((squeal, index) => {
                    return (
                        <>
                            <Squeal
                                type={squeal.type}
                                key={index}
                                id={squeal._id}
                                content={squeal.content}
                                owner={squeal?.ownerID}
                                date={squeal?.datetime}
                                reactions={squeal?.reactions}
                                squealData={squeal}
                            />
                            <Button
                                variant="contained"
                                onClick={() => {
                                    fetch(`/api/squeals/cron/${squeal._id}`, {
                                        method: "DELETE",
                                    })
                                        .then((res) => res.json())
                                        .then((data) => {
                                            mutateScheduledSqueals();
                                        });
                                }}
                            >
                                Delete
                            </Button>
                            <Divider />
                        </>
                    );
                })}
        </section>
    );
};

const SquealsSection = ({ session }) => {
    const {
        data: squeals,
        isLoading: squealsLoading,
        mutate: mutateSqueals,
    } = useSWR(`/api/squeals/${session?.user?.id}`, fetcher);

    if (squealsLoading) return <div>Loading...</div>;

    return (
        <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw]">
            {squeals &&
                squeals.results.map((squeal, index) => {
                    return (
                        <Squeal
                            type={squeal.type}
                            key={index}
                            id={squeal._id}
                            content={squeal.content}
                            owner={squeal?.ownerID}
                            date={squeal?.datetime}
                            reactions={squeal?.reactions}
                            squealData={squeal}
                        />
                    );
                })}
        </section>
    );
};

const AccountPage = () => {
    const { data: session, status } = useSession();

    if (status === "loading") return <div>Loading...</div>;

    if (status === "authenticated")
        return (
            <PageContainer key="account">
                <UserCard session={session} />
                <Tabs>
                    <Tab
                        label="Squeals"
                        content={
                            <AnimatedTabContent>
                                <SquealsSection session={session} />
                            </AnimatedTabContent>
                        }
                    />
                    <Tab
                        label="Scheduled Squeals"
                        content={
                            <AnimatedTabContent>
                                <ScheduledSquealsSection session={session} />
                            </AnimatedTabContent>
                        }
                    />
                </Tabs>
            </PageContainer>
        );
};

export default AccountPage;
