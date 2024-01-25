"use client";

import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import { useUser } from "@/hooks/useUser";
import { Add, Close } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
    fetch(url)
        .then((res) => res.json())
        .then((res) => {
            if (res.error) {
                throw new Error(res.error);
            }

            return res;
        });

const ChooseSMMPage = () => {
    const { data: session } = useSession();

    const { user, mutate: mutateUser } = useUser();

    const [smmName, setSmmName] = useState("");
    const [error, setError] = useState("");

    const {
        data: smms,
        isLoading: smmsLoading,
        mutate,
    } = useSWR(smmName.length > 0 && `/api/users/smm?q=${smmName}`, fetcher);

    const onChange = useCallback((e: any) => {
        mutate();
        setSmmName(e.target.value);
    }, []);

    const onSubmit = (e: any, smm_id) => {
        e.preventDefault();

        fetch("/api/users/setSmm", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                smm_id,
                user_id: session?.user?.id,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) {
                    setError(res.error);
                    return;
                }
                mutateUser();
                setSmmName("");
            });
    };

    const onSubmitDelete = (e: any, smm_id) => {
        e.preventDefault();

        fetch("/api/users/removeSmm", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                smm_id,
                user_id: session?.user?.id,
            }),
        }).then(() => {
            mutateUser();
            setSmmName("");
        });
    };

    return (
        <PageContainer className="gap-4 p-4">
            {user?.controlled_by && (
                <section className="flex flex-col w-full text-start">
                    <h1 className="text-lg">Your SMM</h1>
                    <div className="flex flex-row gap-2 items-center bg-gray-800 rounded-md p-4 w-full">
                        <img
                            src={`data:${user.controlled_by.img.mimetype};base64,${user.controlled_by.img.blob}`}
                            alt="Profile picture"
                            className="rounded-full w-12 h-12"
                        />
                        <p>@{user.controlled_by.name}</p>
                        <button
                            className="ml-auto"
                            onClick={(e) =>
                                onSubmitDelete(e, user.controlled_by._id)
                            }
                        >
                            <Close />
                        </button>
                    </div>
                </section>
            )}

            <section className="flex flex-col w-full">
                <h1 className="text-lg text-start w-full">Choose your SMM</h1>
                <form className="w-full sm:w-[50vw] px-2 bg-gray-700 flex flex-row items-center rounded-md">
                    <input
                        type="text"
                        placeholder="Search for SMM"
                        value={smmName}
                        onChange={onChange}
                        className="rounded-md bg-gray-700 px-2 py-2 w-full focus-within:outline-none"
                    />
                    <div className="">{smmsLoading && <Spinner />}</div>
                </form>

                {error && <p>{error}</p>}
            </section>

            {smms && smms.length === 0 && <p>No SMMs found</p>}
            <section className="flex flex-col gap-4 p-4 w-full sm:w-[60vw]">
                {smms &&
                    smms.length > 0 &&
                    smms.map((smm, index) => {
                        return (
                            <div
                                key={index}
                                className="flex flex-row gap-2 items-center bg-gray-800 rounded-md p-4"
                            >
                                <img
                                    src={`data:${smm.img.mimetype};base64,${smm.img.blob}`}
                                    alt="Profile picture"
                                    className="rounded-full w-12 h-12"
                                />
                                <p>@{smm.name}</p>
                                <button
                                    className="ml-auto"
                                    onClick={(e) => onSubmit(e, smm._id)}
                                >
                                    <Add />
                                </button>
                            </div>
                        );
                    })}
            </section>
        </PageContainer>
    );
};

export default ChooseSMMPage;
