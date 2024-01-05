"use client";

import PageContainer from "@/components/PageContainer";
import {
    SquealsSection,
    UserCard,
} from "@/components/Accounts/AccountsSections";
import useSWR from "swr";
import CustomLink from "@/components/CustomLink";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

const fetcher = (url: string) =>
    fetch(url)
        .then((res) => res.json())
        .then((res) => {
            if (res.error) {
                console.log(res.error);
                throw new Error(res.error);
            }

            return res;
        });

export default function UserPage({ params }: { params: { name: string } }) {
    const { data, isLoading, error } = useSWR(
        `/api/users/name/${params.name}`,
        fetcher
    );

    if (error) return <ErrorMessage message={error.message} />;

    if (isLoading)
        return <PageContainer key="loading"><Spinner /></PageContainer>;

    return (
        <PageContainer key={`profile/${params.name}`}>
            <UserCard id={data._id} />
            <SquealsSection id={data._id} />
        </PageContainer>
    );
}

const ErrorMessage = ({ message }: { message: string }) => {
    
    const router = useRouter();
    
    return (
        <PageContainer
            key="error"
            className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8"
        >
            <img
                alt="Page Not Found"
                className="mx-auto h-12 w-auto"
                height="200"
                src="/squealer.png"
                style={{
                    aspectRatio: "200/200",
                    objectFit: "cover",
                }}
                width="200"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                Oops! {message}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                The page you're looking for doesn't exist or you're not
                authorized to access it.
            </p>
            <div className="mt-6">
                <button
                    className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                    onClick={() => router.back()}
                >
                    Go Back
                </button>
                <CustomLink
                    className="ml-4 inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                    href="/"
                >
                    Home
                </CustomLink>
            </div>
        </PageContainer>
    );
};
