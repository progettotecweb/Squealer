"use client";

import PageContainer from "@/components/PageContainer";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CameraAltOutlined } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function CreatePrivateChannelPage() {
    const [name, setName] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [description, setDescription] = useState("");

    const [img, setImg] = useState({ mimetype: "", blob: "" });

    const { data: session } = useSession();

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

        if(!session) return;

        if(name.length < 4) return alert("Name must be at least 4 characters long");
        if(description.length < 10) return alert("Description must be at least 10 characters long");

        await fetch("/api/channels/createprivate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                description,
                img,
                isPublic,
                user: session?.user.id,
            }),
        }).then((res) => res.json().then((res) => {
            if (res.error) {
                console.log(res.error);
            }
            if(res.ok) setRedirect({ redirect: true, url: `/Channels/${res.channel.name}` });
        }));
    };

    useEffect(() => {
        if(red.redirect) redirect(red.url)
    }, [red])

    return (
        <PageContainer key="shop" className="gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col w-full sm:w-[60vw]">
                <section className="flex flex-col relative h-[20rem]">
                    {img.mimetype ? (
                        <img
                            src={`data:${img.mimetype};base64,${img.blob}`}
                            alt=""
                            className="w-full h-full rounded-t-md object-cover bg-slate-400"
                        />
                    ) : (
                        <div className="w-full h-full rounded-t-md object-cover bg-slate-400"></div>
                    )}
                    <motion.label
                        whileHover={{ opacity: 1 }}
                        htmlFor="img"
                        className="mb-2 font-bold text-lg opacity-1 absolute z-10 w-full h-full cursor-pointer md:opacity-20 grid place-content-center text-center"
                    >
                        <div className="flex items-center">
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
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                            className="p-2 rounded-md bg-gray-600 "
                        />
                        <label htmlFor="name" className="font-bold text-lg">
                            Name
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        <textarea
                            id="description"
                            value={description}
                            onChange={handleDescriptionChange}
                            className="p-2 rounded-md w-[50%] bg-gray-600 resize-none"
                            maxLength={150}
                        />
                        <label
                            htmlFor="description"
                            className="font-bold text-lg"
                        >
                            Description
                        </label>
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
                    <button
                        type="submit"
                        className="py-2 px-6 bg-blue-600 text-white rounded-md self-end"
                    >
                        Create Channel
                    </button>
                </section>
            </form>
        </PageContainer>
    );
}
