import { useState } from "react";

import Tabs, { Tab, AnimatedTabContent } from "@/components/Tabs/Tabs";
import { motion } from "framer-motion";
import AsyncSelect from "react-select/async";
import { useSession } from "next-auth/react";
import Camera from "./Camera";
import Geolocation from "./Geolocation";
import { useSWRConfig } from "swr";

const MAX_LEN = 50;

const Counter: React.FC<{ current_len: number }> = ({ current_len }) => {
    const color =
        MAX_LEN - current_len < MAX_LEN ? "text-red-500" : "text-slate-50";

    return (
        <div className="text-center">
            <span className={`${color}`}>{MAX_LEN - current_len}</span>
            <span>/{MAX_LEN}</span>
        </div>
    );
};

const SquealCreator = () => {
    interface Content {
        text: string | null;
        img: {
            mimetype: string;
            blob: string;
        } | null;
        video: {
            mimetype: string;
            blob: string;
        } | null;
        geolocation: {
            latitude: number;
            longitude: number;
        } | null;
    }

    const { mutate } = useSWRConfig();

    const [message, setMessage] = useState("");
    const [img, setImg] = useState<string | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [geolocation, setGeolocation] = useState<[number, number] | null>(
        null
    );
    const [content, setContent] = useState<Content>({
        text: null,
        img: null,
        video: null,
        geolocation: null,
    });
    const [repeatMessage, setRepeatMessage] = useState<boolean>(false);
    const [repetitionExpr, setRepetitionExpr] = useState<string>("");
    const [type, setType] = useState<
        "text" | "image" | "video" | "geolocation"
    >("text");
    const [query, setQuery] = useState<string>("");
    const { data: session } = useSession();
    const [activeTabNumber, setActiveTabNumber] = useState<number>(0);

    const handleTabChange = (index: number) => {
        //setType(index === 0 ? "text" : index === 1 ? "image" : "geolocation");
        switch (index) {
            case 0:
                setType("text");
                break;
            case 1:
                setType("image");
                break;
            case 2:
                setType("video");
                break;
            case 3:
                setType("geolocation");
                break;
        }
    };

    const submitSqueal = async (e) => {
        e.preventDefault();

        fetch("/api/squeals/post", {
            method: "POST",
            body: JSON.stringify({
                ownerID: session?.user.id,
                type: type,
                content: content,
                recipients: selected.map((res) => res.value),
                automatic: repeatMessage,
                cronJobExpr: repetitionExpr || undefined,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => {
            if (res.status === 200) {
                mutate(`/api/squeals/${session?.user.id}`);
            }
        })

        setMessage("");
        setContent({
            text: null,
            img: null,
            video: null,
            geolocation: null,
        });
        setActiveTabNumber(0);
        setSelected([]);
        setQuery("");
        setRepetitionExpr("");
        setRepeatMessage(false);
    };

    const [selected, setSelected] = useState<any[]>([]);

    const onChange = (data) => {
        setSelected(data);
        setQuery("");
    };

    const handleImg = (file, setContentToUpdate = false) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const imgDataUrl = reader.result as string;
                setImg(imgDataUrl);

                if (setContentToUpdate) {
                    setContent({
                        text: null,
                        img: formatImg(imgDataUrl),
                        video: null,
                        geolocation: null,
                    });
                }

                resolve(imgDataUrl); // resolve promise
            };

            reader.onerror = (error) => {
                reject(error); // reject promise if something goes wrong
            };

            reader.readAsDataURL(file.files[0]);
        });
    };

    const handleVideo = (file, setContentToUpdate = false) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const videoDataUrl = reader.result as string;
                setVideo(videoDataUrl);

                if (setContentToUpdate) {
                    setContent({
                        text: null,
                        img: null,
                        video: formatImg(videoDataUrl),
                        geolocation: null,
                    });
                }

                resolve(videoDataUrl); // resolve promise
            };

            reader.onerror = (error) => {
                reject(error); // reject promise if something goes wrong
            };

            reader.readAsDataURL(file.files[0]);
        });
    };

    const handleContent = async (e: any) => {
        const { name, value } = e.target;
        switch (type) {
            case "text":
                setMessage(value);
                setContent({ ...content, [type]: value });
                break;
            case "image":
                //check if file uploaded is an image
                if (!e.target.files[0].type.startsWith("image")) {
                    alert("File must be an image");
                } else {
                    await handleImg(e.target, true);
                }
                break;
            case "video":
                //check if file uploaded is a video
                if (!e.target.files[0].type.startsWith("video")) {
                    alert("File must be a video");
                } else {
                    await handleVideo(e.target, true);
                }
                break;
        }
    };

    const formatImg = (img: string | null) => {
        if (!img) {
            console.log("no img");
            return null;
        }
        let myImg = { mimetype: "", blob: "" };
        const imgSplit = img.split(",");
        const imgType = imgSplit[0].split(";")[0].split(":")[1];
        const imgBlob = imgSplit[1];
        myImg = { mimetype: imgType, blob: imgBlob };

        return myImg;
    };

    const handleCapture = (img: string) => {
        console.log(img);
        setImg(img);
        setContent({
            text: null,
            img: formatImg(img),
            video: null,
            geolocation: null,
        });
    };

    const handleLocation = (lat: number, lng: number) => {
        setGeolocation([lat, lng]);
        setContent({
            text: null,
            img: null,
            video: null,
            geolocation: { latitude: lat, longitude: lng },
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-grey-500 p-4 md:bg-[#111B21] md:rounded-lg md:mb-2">
            <AsyncSelect
                isMulti
                cacheOptions
                value={selected}
                onChange={onChange}
                onInputChange={(inputValue) => {
                    setQuery(inputValue);
                }}
                loadOptions={async (inputValue) => {
                    const res = await fetch(`/api/search?q=${inputValue}`);
                    const data = await res.json();
                    return data.results.map((res) => {
                        return {
                            value: {
                                type: query.startsWith("@")
                                    ? "User"
                                    : "Channel",
                                id: res.id,
                            },
                            label: res.name,
                        };
                    });
                }}
            />

            <Counter current_len={message.length} />
            <Tabs onTabChange={handleTabChange}>
                <Tab
                    label="Text"
                    content={
                        <AnimatedTabContent>
                            <form name="squeal-post" className="md:h-[10vh]">
                                <p>
                                    <input
                                        type="checkbox"
                                        id="repeat"
                                        name="repeat"
                                        checked={repeatMessage}
                                        onClick={() => {
                                            setRepeatMessage(!repeatMessage);
                                        }}
                                    />
                                    <label htmlFor="repeat">Repeat</label>
                                    {repeatMessage && (
                                        <p>
                                            <input
                                                type="text"
                                                id="repeat"
                                                name="repeat"
                                                placeholder="Cron job"
                                                value={repetitionExpr}
                                                onChange={(e) => {
                                                    setRepetitionExpr(
                                                        e.target.value
                                                    );
                                                }}
                                                className="text-slate-700"
                                            />
                                            <label htmlFor="repeat">
                                                Cron job
                                            </label>
                                        </p>
                                    )}
                                </p>
                                <motion.textarea
                                    maxLength={MAX_LEN}
                                    //onChange={(e) => { setMessage(e.target.value) }}
                                    onChange={handleContent}
                                    value={message}
                                    id="message"
                                    rows={4}
                                    className="block p-2.5 w-full text-sm bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none"
                                    placeholder="What's happening?"
                                ></motion.textarea>
                            </form>
                        </AnimatedTabContent>
                    }
                />
                <Tab
                    label="Image"
                    content={
                        <AnimatedTabContent>
                            <div className="flex justify-center">
                                <Camera onCapture={handleCapture} />
                                {img && (
                                    <img
                                        className="rounded-lg imgPreview ml-24"
                                        src={img}
                                    />
                                )}
                            </div>
                            <p className="mt-4 mb-4">OR</p>
                            <input
                                className="md:h-[10vh]"
                                accept="image/*"
                                id="icon-button-file"
                                type="file"
                                capture="environment"
                                onChange={(e) => {
                                    handleContent(e);
                                }}
                            />
                        </AnimatedTabContent>
                    }
                />
                <Tab
                    label="Video"
                    content={
                        <AnimatedTabContent>
                            <div className="flex justify-center">
                                {video && (
                                    <video
                                        className="rounded-lg imgPreview ml-24"
                                        src={video}
                                        controls={true}
                                    />
                                )}
                            </div>
                            <p className="mt-4 mb-4">OR</p>
                            <input
                                className="md:h-[10vh]"
                                accept="video/*"
                                id="icon-button-file"
                                type="file"
                                capture="environment"
                                onChange={(e) => {
                                    handleContent(e);
                                }}
                            />
                        </AnimatedTabContent>
                    }
                />
                <Tab
                    label="Geolocation"
                    content={
                        <AnimatedTabContent>
                            <Geolocation onLocation={handleLocation} />
                        </AnimatedTabContent>
                    }
                />
            </Tabs>
            <div className="flex justify-between items-center mt-4">
                <button
                    type="submit"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={submitSqueal}
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default SquealCreator;
