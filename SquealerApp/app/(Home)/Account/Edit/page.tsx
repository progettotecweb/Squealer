"use client";

import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

export default function EditPage() {
    const fetcher = (url: string) =>
        fetch(url)
            .then((res) => res.json())
            .then((res) => {
                newDesc(res.bio);
                return res;
            });
    const { data: session } = useSession();
    const { data, isLoading } = useSWR(
        session ? `/api/users/${session?.user.id}` : null,
        fetcher
    );

    const [desc, newDesc] = useState<string>(data?.bio);
    const textRef = useRef<HTMLTextAreaElement>(null);

    const [img, setImg] = useState(data?.img);

    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

    const [error, setError] = useState<string>("");

    const [requestLoading, setRequestLoading] = useState<boolean>(false);

    const router = useRouter();

    const requestEdit = async () => {
        setRequestLoading(true);
        if (!oldPassword && (newPassword || confirmNewPassword)) {
            setError("Please enter your current password");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match");
            return;
        }

        await fetch(`/api/users/${session?.user.id}/edit`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                bio: textRef.current?.value,
                oldPassword,
                newPassword,
                img
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    setError("Successfully updated profile");
                } else {
                    setError(`Failed to update profile\n${res.error}`);
                }
            })
            .finally(() => {
                setRequestLoading(false);
                mutate(`/api/users/${session?.user.id}`);
                router.push("/Account");
            });
    };

    const formatImg = (img: string) => {
        let myImg = { mimetype: "", blob: "" };
        const imgSplit = img.split(",");
        const imgType = imgSplit[0].split(";")[0].split(":")[1];
        const imgBlob = imgSplit[1];
        myImg = { mimetype: imgType, blob: imgBlob };

        return myImg;
    };

    useEffect(() => {
        if (error) {
            setTimeout(() => setError(""), 3000);
        }
    }, [error]);

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

    const hiddenFileInput = useRef<HTMLInputElement>(null);

    const {mutate} = useSWRConfig()

    if (isLoading) return <div>Loading...</div>;

    return (
        <PageContainer>
            <main className="flex flex-col gap-4">
                <h1 className="self-start text-2xl">Edit Profile</h1>

                <section className="bg-gray-700 p-2 rounded-md flex gap-4 items-center">
                    <img
                        src={`data:${img?.mymetype || data?.img.mimetype};base64,${ img?.blob || data?.img.blob}`}
                        alt="Profile Picture"
                        className="w-16 h-16 rounded-full object-cover"
                    />
                    <h2 className="text-2xl">{data?.name}</h2>

                    <button className="ml-auto bg-amarettoSour-800 px-4 py-2 rounded-md hover:bg-amarettoSour-900"
                    onClick={(e) => {
                        hiddenFileInput?.current?.click();
                    }}>
                    Choose new profile picture
                    <input
                        ref={hiddenFileInput}
                        style={{display: "none"}}
                        accept="image/*"
                        id="icon-button-file"
                        type="file"
                        capture="environment"
                        onChange={async (e) => await handleImg(e.target)}
                    />
                    </button>
                    
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl self-start">Bio</h2>
                    <textarea
                        className="w-full bg-gray-700 text-white rounded-md p-2 resize-none"
                        value={desc}
                        maxLength={150}
                        rows={4}
                        spellCheck={false}
                        onChange={(e) => newDesc(e.target.value)}
                        ref={textRef}
                    />
                    <div>{textRef.current?.value.length}/150</div>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl self-start">Change Password</h2>
                    <input
                        className="w-full bg-gray-700 text-white rounded-md p-2"
                        type="password"
                        placeholder="Current Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <input
                        className="w-full bg-gray-700 text-white rounded-md p-2"
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        className="w-full bg-gray-700 text-white rounded-md p-2"
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                </section>

                <button
                    className="ml-auto bg-amarettoSour-800 px-4 py-2 rounded-md hover:bg-amarettoSour-900 w-[45%]"
                    onClick={() => {
                        requestEdit();
                    }}
                    disabled={requestLoading}
                >
                    {requestLoading ? <Spinner /> : "Save Changes"}
                </button>
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            className="bg-red-500 p-2 rounded-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </PageContainer>
    );
}
