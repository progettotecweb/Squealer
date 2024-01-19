"use client";

import PageContainer from "@/components/PageContainer";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CameraAltOutlined } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import useSWR, { Fetcher } from "swr";
import { set } from "mongoose";

interface Result {
    name: string;
    description: string;
    _id: string;
    squeals: any[];
    official: boolean;
    banner: { mimetype: string; blob: string };
    followers: string[];
    error?: string;
    administrators: {
        name: string;
        img: {
            mimetype: string;
            blob: string;
        };
    }[];
    owner_id?: string;
    visibility?: boolean;
}

export default function CreatePrivateChannelPage({
    params,
}: {
    params: { name: string };
}) {
    const [name, setName] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [description, setDescription] = useState("");
    const [admins, setAdmins] = useState<
        {
            name: string;
            img: {
                mimetype: string;
                blob: string;
            };
            state?: "removing" | "adding";
        }[]
    >([]);

    const [img, setImg] = useState({ mimetype: "", blob: "" });

    const { data: session } = useSession();

    const fetcher: Fetcher<Result, string> = (...args) =>
        fetch(...args)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if (res.error) throw new Error(res.error);
                return res;
            })
            .then((res) => {
                name === "" && setName(res.name);
                description === "" && setDescription(res.description);
                img.blob === "" && setImg(res.banner);
                setIsPublic(res.visibility === "public");
                admins.length === 0 && setAdmins(res.administrators);

                return res;
            });

    const { data, isLoading, mutate, error } = useSWR(
        `/api/channels/${params.name}?sq=false`,
        fetcher,
        { revalidateOnFocus: false }
    );

    const formatImg = (img: string) => {
        let myImg = { mimetype: "", blob: "" };
        const imgSplit = img.split(",");
        const imgType = imgSplit[0].split(";")[0].split(":")[1];
        const imgBlob = imgSplit[1];
        myImg = { mimetype: imgType, blob: imgBlob };

        return myImg;
    };

    const handleImg = (file, setContentToUpdate = false) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const imgDataUrl = reader.result as string;
                setImg(formatImg(imgDataUrl));

                resolve(imgDataUrl); // resolve promise
            };

            reader.onerror = (error) => {
                reject(error); // reject promise if something goes wrong
            };

            reader.readAsDataURL(file.files[0]);
        });
    };

    const handleImgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleImg(event.target);

        console.log(event.target.value);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handlePublicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsPublic(event.target.checked);
    };

    const handleDescriptionChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setDescription(event.target.value);
    };

    const [red, setRedirect] = useState({
        redirect: false,
        url: "",
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // TODO: Handle form submission

        if (!session) return;

        if (name.length < 4)
            return alert("Name must be at least 4 characters long");
        if (description.length < 10)
            return alert("Description must be at least 10 characters long");

        await fetch(`/api/app/channels/id/${data?._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                description,
                img,
                isPublic,
                user: session?.user.id,
                administrators: admins,
            }),
        }).then((res) =>
            res.json().then((res) => {
                if (res.error) {
                    console.log(res.error);
                }

                console.log(res);

                if (res.ok)
                    setRedirect({
                        redirect: true,
                        url: `/Channels/${res.channel.name}`,
                    });
            })
        );
    };

    useEffect(() => {
        if (red.redirect) redirect(red.url);
    }, [red]);

    const [newName, setNewName] = useState("");

    const [results, setResults] = useState<any[]>([]);

    const handleNewNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNewName(event.target.value);

        if (event.target.value.length === 0) return setResults([]);

        if (event.target.value.length > 0) {
            fetch(`/api/search?q=@${event.target.value}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) =>
                res.json().then((res) => {
                    console.log(res);
                    // only show results that are not already admins
                    setResults([
                        ...res.results.filter(
                            (res) =>
                                !admins
                                    .map((adm) => adm.name)
                                    .includes(res.name)
                        ),
                    ]);
                })
            );
        }
    };

    if (isLoading)
        return (
            <PageContainer key="shop" className="gap-4">
                Loading...
            </PageContainer>
        );

    return (
        <PageContainer key="shop" className="gap-4 mb-20">
            <main className="flex flex-col md:flex-row  rounded-md bg-gray-800 md:w-[65vw]">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 w-full rounded-md"
                >
                    <section className="flex flex-col relative h-[20rem]">
                        {img.mimetype ? (
                            <motion.img
                                src={`data:${img.mimetype};base64,${img.blob}`}
                                alt=""
                                className="w-full h-full rounded-tl-md rounded-br-lg object-cover bg-slate-400"
                            />
                        ) : (
                            <div className="w-full h-full rounded-tl-md rounded-br-lg object-cover bg-slate-400"></div>
                        )}
                        <motion.label
                            whileHover={{ opacity: 1 }}
                            htmlFor="img"
                            className="mb-2 font-bold text-lg absolute z-10 w-full h-full cursor-pointer opacity-60 grid place-content-center text-center bg-gray-800 bg-opacity-70"
                        >
                            <div className="flex items-center ">
                                <CameraAltOutlined className="w-10 h-10" />
                                Banner
                            </div>
                        </motion.label>

                        <motion.input
                            type="file"
                            accept="image/*"
                            id="img"
                            onChange={handleImgChange}
                            value=""
                            className="p-2 border rounded-md opacity-0 file:hidden hidden"
                        />
                    </section>
                    <section className="rounded-b-md bg-gray-800 p-4 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row-reverse md:items-center md:self-start gap-2">
                            <label htmlFor="name" className="font-bold text-lg">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={handleNameChange}
                                className="p-2 rounded-md bg-gray-600 "
                            />
                        </div>

                        <div className="flex flex-col md:flex-row-reverse md:items-center md:self-start gap-2">
                            <label
                                htmlFor="description"
                                className="font-bold text-lg"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={handleDescriptionChange}
                                className="p-2 rounded-md bg-gray-600 resize-none w-full"
                                maxLength={150}
                            />
                        </div>
                        <div className="flex items-center">
                            <label
                                htmlFor="public"
                                className="mr-2 font-bold text-lg"
                            >
                                Public
                            </label>
                            <input
                                type="checkbox"
                                id="public"
                                checked={isPublic}
                                onChange={handlePublicChange}
                                className="h-6 w-6 text-blue-600 rounded"
                            />
                        </div>
                    </section>
                    <button
                type="submit"
                className="py-2 px-6 bg-blue-600 text-white rounded-md self-end"
            >
                Edit Channel
            </button>
                </form>
                <div className="flex flex-col gap-2 p-4">
                    <h1>Administrators</h1>
                    {admins.map((adm, index) => {
                        return (
                            <motion.div
                                layout
                                key={index}
                                className={`bg-gray-800 flex flex-row items-center px-4 py-1 gap-4 rounded-md`}
                                animate={{
                                    backgroundColor:
                                        adm.state === "removing"
                                            ? "#ef4444"
                                            : "#4b5563",
                                }}
                            >
                                {adm?.state === "removing" && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                        />
                                    </svg>
                                )}
                                <motion.img
                                    layout
                                    src={
                                        adm?.img
                                            ? `data:${adm?.img?.mimetype};base64,${adm?.img?.blob}`
                                            : "/deleted.webp"
                                    }
                                    alt="Profile Picture"
                                    className="object-fit w-10 h-10 rounded-full"
                                />
                                <motion.p layout>{adm?.name}</motion.p>

                                <motion.button
                                    layout
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    onClick={(e) => {
                                        // set adm state to removing
                                        e.preventDefault();
                                        setAdmins((prev) => {
                                            const newAdmins = [...prev];
                                            newAdmins[index].state ===
                                            "removing"
                                                ? (newAdmins[index].state =
                                                      "adding")
                                                : (newAdmins[index].state =
                                                      "removing");
                                            return newAdmins;
                                        });
                                    }}
                                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={adm.name === session?.user.name}
                                >
                                    <motion.svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className={"w-6 h-6"}
                                        animate={{
                                            rotate:
                                                adm.state === "removing"
                                                    ? 45
                                                    : 0,
                                        }}
                                    >
                                        <motion.path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18 18 6M6 6l12 12"
                                        />
                                    </motion.svg>
                                </motion.button>
                                <motion.div className="ml-auto">
                                    {adm.name === session?.user.name && "👑"}
                                </motion.div>
                            </motion.div>
                        );
                    })}

                    <motion.div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-row items-center gap-4">
                                <input
                                    type="text"
                                    id="name"
                                    className="p-2 rounded-md bg-gray-600 "
                                    value={newName}
                                    onChange={handleNewNameChange}
                                    placeholder="Add more admins..."
                                />
                                <label
                                    htmlFor="name"
                                    className="font-bold text-lg"
                                >
                                    Name
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            {results.map((res, index) => {
                                return (
                                    <motion.div
                                        key={index}
                                        className={
                                            "bg-gray-800 flex flex-row items-center px-4 py-1 gap-4 rounded-md "
                                        }
                                    >
                                        <motion.p>{res?.name}</motion.p>

                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.1 }}
                                            onClick={(e) => {
                                                // set adm state to removing
                                                e.preventDefault();
                                                setAdmins((prev) => {
                                                    const newAdmins = [...prev];
                                                    newAdmins.push({
                                                        ...res,
                                                        state: "adding",
                                                    });
                                                    return newAdmins;
                                                });
                                                setNewName("");
                                                setResults([]);
                                            }}
                                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <motion.svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className={"w-6 h-6 rotate-45"}
                                            >
                                                <motion.path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18 18 6M6 6l12 12"
                                                />
                                            </motion.svg>
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </main>
            
        </PageContainer>
    );
}
