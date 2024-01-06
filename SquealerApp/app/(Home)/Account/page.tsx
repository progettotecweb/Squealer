"use client";

import Divider from "@/components/Divider";
import PageContainer from "@/components/PageContainer";
import Squeal from "@/components/Squeal/Squeal";
import Tabs, { AnimatedTabContent, Tab } from "@/components/Tabs/Tabs";
import { Button } from "@mui/material";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import { SquealsSection, AccountUserCard } from "@/components/Accounts/AccountsSections";
import Spinner from "@/components/Spinner";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

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

const AccountPage = () => {
    const { data: session, status } = useSession();

    if (status === "loading") return <PageContainer key="loading"><Spinner /></PageContainer>;

    if (status === "authenticated")
        return (
            <PageContainer key="account">
                <AccountUserCard id={session?.user.id} />
                <Tabs>
                    <Tab
                        label="Squeals"
                        content={
                            <AnimatedTabContent>
                                <SquealsSection id={session?.user.id} />
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
