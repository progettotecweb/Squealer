import useSWR from "swr";
import Squeal, { SquealSkeleton } from "../Squeal/Squeal";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { signOut, useSession } from "next-auth/react";

import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import Divider from "../Divider";
import Close from "@mui/icons-material/Close";
import CustomLink from "../CustomLink";
import useSWRInfinite from "swr/infinite";
import Spinner from "../Spinner";

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

    return (
        <section className="w-full md:w-[60vw] grid grid-cols-6">
            <div className="w-full col-span-2 sm:grid sm:place-content-center flex justify-center pt-6">
                <img
                    src={`/api/media/${data.img}`}
                    alt="Profile Picture"
                    className="rounded-full w-24 h-24 sm:w-32 sm:h-32 col-span-2 object-cover"
                />
            </div>
            <section className="p-4 flex flex-col h-full items-start gap-4 col-span-4">
                <div className="flex gap-2 items-center">
                    <h1 className="text-2xl font-bold text-white">
                        {data?.name}
                    </h1>
                </div>
                <div className="flex sm:text-lg gap-16 items-center justify-center">
                    <h1 className="flex">{data.squeals.length} Squeals</h1>
                    <h1 className="flex ">{data.following.length} Following</h1>
                </div>
                <div className="self-start h-full text-md max-w-full text-wrap overflow-x-auto text-start">
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
                className=" rounded-full object-cover"
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
        <>
            <section className="w-full md:w-[60vw] grid grid-cols-6">
                <div className="w-full col-span-2 sm:grid sm:place-content-center flex justify-center pt-6">
                    <img
                        src={`/api/media/${data.img}`}
                        alt="Profile Picture"
                        className="rounded-full w-24 h-24 sm:w-32 sm:h-32 col-span-2 object-cover"
                    />
                </div>
                <section className="p-4 flex flex-col h-full items-start gap-4 col-span-4">
                    <div className="flex gap-2 items-center">
                        <h1 className="text-2xl font-bold text-white">
                            {data?.name}
                        </h1>
                        <div className="hidden sm:flex gap-2">
                            <Link
                                className="bg-gray-700 px-4 py-1 rounded-md hover:bg-gray-800"
                                href="/Account/Edit"
                            >
                                Edit profile
                            </Link>
                            <Link
                                href="/Account/SMM"
                                className="bg-gray-700 px-4 py-1  rounded-md hover:bg-gray-800"
                            >
                                Add SMM
                            </Link>
                            <DeleteAccountModal id={id} name={data?.name} />
                        </div>
                    </div>
                    <div className="flex sm:text-lg gap-16 items-center justify-center">
                        <h1 className="flex">{data.squeals.length} Squeals</h1>
                        <h1 className="flex ">
                            {data.following.length} Following
                        </h1>
                    </div>
                    <div className="self-start h-full text-md max-w-full text-wrap overflow-x-auto text-start">
                        {data.bio}
                    </div>
                </section>
            </section>
        </>
    );
};

export const MobileAccountMenu = ({ id, name }) => {
    const [open, setOpen] = useState(false);

    const { data: session, status } = useSession();

    return (
        <>
            <button onClick={() => setOpen(true)} className="">
                {open ? <Close /> : <MenuIcon />}
            </button>
            <Drawer
                open={open}
                anchor="left"
                onClose={() => setOpen(false)}
                classes={{
                    paper: "",
                }}
            >
                <aside className="size-full flex flex-col gap-4 items-start text-lg w-[70vw] bg-gray-800 text-gray-50 p-4">
                    {status === "authenticated" &&
                        ["SMM", "Mod"].includes(session?.user?.role) && (
                            <>
                                <CustomLink href="/Account/SMM">
                                    Add Social Media Manager
                                </CustomLink>

                                <CustomLink href="/SMM" type="a">
                                    Switch to SMM
                                </CustomLink>
                            </>
                        )}

                    {status === "authenticated" &&
                        ["Mod"].includes(session?.user?.role) && (
                            <CustomLink href="/Moderator" type="a">
                                Switch to Moderator
                            </CustomLink>
                        )}

                    <Divider className="w-full" />

                    <button onClick={() => signOut()}>Sign out</button>
                    <Link className="" href="/Account/Edit">
                        Edit profile
                    </Link>
                    <DeleteAccountModal id={id} name={name} />
                </aside>
            </Drawer>
        </>
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
                className="bg-red-500 text-gray-50 px-4 py-1 rounded-md hover:bg-red-600 sm:ml-auto"
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
    // const {
    //     data: squeals,
    //     isLoading: squealsLoading,
    //     mutate: mutateSqueals,
    // } = useSWR(`/api/squeals/${id}`, fetcher);

    const [contentFinished, setContentFinished] = useState(false);

    const getKey = (pageIndex: any, previousPageData: string | any[]) => {
        if (previousPageData && !previousPageData.length) {
            setContentFinished(true);
            return null;
        } // reached the end

        return `/api/squeals/${id}?page=${pageIndex}&limit=10`;
    };

    const fetcher = (url: string) =>
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.length === 0) {
                    setContentFinished(true)
                }

                if(data.length < 10) {
                    setContentFinished(true)
                }

                return data;
            });

    const {
        data,
        size,
        setSize,
        isLoading: squealsLoading,
        isValidating,
        mutate: mutateSqueals,
    } = useSWRInfinite(getKey, fetcher);

    // useEffect(() => {
    //     const handleScroll = (e) => {
    //         const scrollHeight = e.target.documentElement.scrollHeight;
    //         const currentHeight =
    //             e.target.documentElement.scrollTop + window.innerHeight;
    //         if (currentHeight + 1 >= scrollHeight && !contentFinished) {
    //             console.log(`Requesting next page (${contentFinished ? "finished" : "not finished"})`)
    //             setSize(size + 1);
    //         }
    //     };
    //     window.addEventListener("scroll", handleScroll);
    //     return () => window.removeEventListener("scroll", handleScroll);
    // }, []);


    useEffect(() => {
        console.log(`Content is ${contentFinished ? "finished" : "not finished"}, size is ${size}`)
    }, [contentFinished, size])

    return (
        <section className="mt-2 flex flex-col gap-2 w-full md:w-[60vw] mb-16">
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
                              recipients={squeal?.recipients}
                          />
                      ));
                  })
                : [1, 2, 3, 4, 5, 6, 7].map((_, index) => (
                      <div key={index}>
                          <SquealSkeleton />
                      </div>
                  ))}
            {isValidating || (squealsLoading && <Spinner />)}
                    {!contentFinished ? <button onClick={() => setSize(size + 1)}>Load more</button> : <button onClick={() => window.scroll(0,0)}>Go back</button>}
        </section>
    );
};
