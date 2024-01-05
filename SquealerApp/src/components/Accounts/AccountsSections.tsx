import useSWR from "swr";
import Squeal, { SquealSkeleton } from "../Squeal/Squeal";
import Link from "next/link";
import { useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { signOut } from "next-auth/react";

const fetcher = (url: string) =>
    fetch(url)
        .then((res) => res.json())
        .then((res) => {
            if (res.error) {
                throw new Error(res.error);
            }

            return res;
        });

export const UserCard = ({ id }) => {
    const { data, isLoading, error } = useSWR(`/api/users/${id}`, fetcher);

    if (error) return <div>{error.message}</div>;

    if (isLoading) return;
    <section>
        <div className="flex flex-col items-center justify-center p-4">
            <img
                src={`/squealer.png`}
                alt="Profile Picture"
                className="w-32 h-32 rounded-full object-cover"
            />
        </div>
        <section className="col-span-3 p-4 flex flex-col h-full items-start gap-4 w-full">
            <div className="flex gap-2 items-center w-full">
                <h1 className="text-2xl font-bold text-white">Loading...</h1>
            </div>
            <div className="flex text-lg gap-16">
                <h1 className="flex">
                    <h2>Loading...</h2>
                </h1>
                <h1 className="flex">
                    <h2>Loading...</h2>
                </h1>
            </div>
            <div className="self-start h-full flex items-center text-md">
                Loading...
            </div>
        </section>
    </section>;

    return (
        <section className="w-full md:w-[60vw]  grid grid-cols-4">
            <div className="flex flex-col items-center justify-center p-4">
                <img
                    src={`data:${data?.img.mimetype};base64,${data?.img.blob}`}
                    alt="Profile Picture"
                    className="w-32 h-32 rounded-full object-cover"
                />
            </div>
            <section className="col-span-3 p-4 flex flex-col h-full items-start gap-4 w-full">
                <div className="flex gap-2 items-center w-full">
                    <h1 className="text-2xl font-bold text-white">
                        {data?.name}
                    </h1>
                </div>
                <div className="flex text-lg gap-16">
                    <h1 className="flex">
                        <h2>{data.squeals.length} Squeals</h2>
                    </h1>
                    <h1 className="flex">
                        <h2>{data.following.length} Following</h2>
                    </h1>
                </div>
                <div className="self-start h-full flex items-center text-md">
                    {data.bio}
                </div>
            </section>
        </section>
    );
};

export const AccountUserCard = ({ id }) => {
    const { data, isLoading } = useSWR(`/api/users/${id}`, fetcher);

    if (isLoading) return;
    <section>
        <div className="flex flex-col items-center justify-center p-4">
            <img
                src={`/squealer.png`}
                alt="Profile Picture"
                className="max-w-32 max-h-32 rounded-full object-cover"
            />
        </div>
        <section className="col-span-3 p-4 flex flex-col h-full items-start gap-4 w-full">
            <div className="flex gap-2 items-center w-full">
                <h1 className="text-2xl font-bold text-white">Loading...</h1>
            </div>
            <div className="flex text-lg gap-16">
                <h1 className="flex">
                    <h2>Loading...</h2>
                </h1>
                <h1 className="flex">
                    <h2>Loading...</h2>
                </h1>
            </div>
            <div className="self-start h-full flex items-center text-md">
                Loading...
            </div>
        </section>
    </section>;

    return (
        <section className="w-full md:w-[60vw]  grid grid-cols-4">
            <div className="flex flex-col items-center justify-center p-4">
                <img
                    src={`data:${data?.img.mimetype};base64,${data?.img.blob}`}
                    alt="Profile Picture"
                    className="max-w-32 max-h-32 rounded-full object-cover"
                />
            </div>
            <section className="col-span-3 p-4 flex flex-col h-full items-start gap-4 w-full">
                <div className="flex gap-2 items-center w-full">
                    <h1 className="text-2xl font-bold text-white">
                        {data?.name}
                    </h1>
                    <Link
                        className="bg-gray-700 px-4 py-1 rounded-md hover:bg-gray-800"
                        href="/Account/Edit"
                    >
                        Edit profile
                    </Link>
                    <DeleteAccountModal id={id} name={data?.name} />
                </div>
                <div className="flex text-lg gap-16">
                    <h1 className="flex">
                        <h2>{data.squeals.length} Squeals</h2>
                    </h1>
                    <h1 className="flex">
                        <h2>{data.following.length} Following</h2>
                    </h1>
                </div>
                <div className="self-start h-full flex items-center text-md">
                    {data.bio}
                </div>
            </section>
        </section>
    );
};

const DeleteAccountModal = (props: { id: string; name: string }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);

    const handleClickOpen = (e) => {
        e.preventDefault();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const requestDelete = (e) => {
        e.preventDefault();
        if (inputRef?.current?.value === props.name) {
            fetch("/api/users/" + props.id, {
                method: "DELETE",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.error) {
                        throw new Error(res.error);
                    }

                    signOut();
                });
        } else {
            alert("Incorrect username");
        }
    };

    return (
        <>
            <button
                className="bg-red-500 text-gray-50 px-4 py-1 rounded-md hover:bg-red-600 ml-auto"
                onClick={handleClickOpen}
            >
                Delete Account
            </button>

            <Dialog
                open={open}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                classes={{ paper: "bg-gray-700 text-gray-50" }}
            >
                <DialogTitle id="alert-dialog-title">
                    <img
                        src={`/squealer.png`}
                        alt="Profile Picture"
                        className="w-[25%] h-[25%] rounded-full object-cover"
                    />
                    It's sad to see you go {props.name}!
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        id="alert-dialog-description"
                        className="text-gray-50 flex flex-col gap-2"
                    >
                        <p>Are you sure you want to delete your account?</p>
                        <p>If so, type in your username and confirm.</p>
                        <input
                            className="bg-gray-600 rounded-md px-4 py-1"
                            type="text"
                            placeholder="Username"
                            ref={inputRef}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <button
                        className="bg-gray-600 rounded-md px-4 py-1 hover:bg-gray-700"
                        onClick={handleClose}
                    >
                        Go back
                    </button>
                    <button
                        className="bg-red-600 rounded-md px-4 py-1 hover:bg-red-700"
                        onClick={requestDelete}
                    >
                        Confirm
                    </button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export const SquealsSection = ({ id }) => {
    const {
        data: squeals,
        isLoading: squealsLoading,
        mutate: mutateSqueals,
    } = useSWR(`/api/squeals/${id}`, fetcher);

    return (
        <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw]">
            {!squealsLoading
                ? squeals?.results.map((squeal, index) => {
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
                  })
                : [1, 2, 3, 4, 5, 6, 7].map((_, index) => {
                      return <SquealSkeleton key={index} />;
                  })}
        </section>
    );
};
