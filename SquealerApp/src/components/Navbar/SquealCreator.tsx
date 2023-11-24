import { ChangeEvent, useState } from "react";

import Tabs, { Tab, AnimatedTabContent } from "@/components/Tabs/Tabs";
import { AnimatePresence, motion } from "framer-motion";
import useSWR, { Fetcher } from "swr";
import AsyncSelect from "react-select/async";
import { set } from "mongoose";
import { useSession } from "next-auth/react";
import { formControlLabelClasses } from "@mui/material";
import Camera from "./Camera";
import Geolocation from "./Geolocation";

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
        geolocation: {
            latitude: number;
            longitude: number;
        } | null;
    }

    const [message, setMessage] = useState("");
    const [img, setImg] = useState<string | null>(null);
    const [geolocation, setGeolocation] = useState<[number, number] | null>(null);
    const [content, setContent] = useState<Content>({
        text: null,
        img: null,
        geolocation: null,
    });
    const [type, setType] = useState<"text" | "image" | "geolocation">("text");
    const [query, setQuery] = useState<string>("");
    const { data: session } = useSession();
    const [activeTabNumber, setActiveTabNumber] = useState<number>(0);

    const handleTabChange = (index: number) => {
        setType(index === 0 ? "text" : index === 1 ? "image" : "geolocation");
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
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        setMessage("");
        setContent({
            text: null,
            img: null,
            geolocation: null,
        });
        setActiveTabNumber(0);
        setSelected([]);
        setQuery("");
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
                    setContent({ text: null, img: formatImg(imgDataUrl), geolocation: null });
                }

                resolve(imgDataUrl); // resolve promise
            };

            reader.onerror = (error) => {
                reject(error); // reject promise if something goes wrong
            };

            reader.readAsDataURL(file.files[0]);
        });
    };

    const handleContent = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        switch (type) {
            case "text":
                setMessage(value);
                setContent({ ...content, [type]: value });
                break;
            case "image":
                await handleImg(e.target, true);
                //setContent({ text: null, img: formatImg(img), geolocation: null });
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
        myImg = { mimetype: imgType, blob: imgBlob }

        return myImg;
    };

    const handleCapture = (img: string) => {
        console.log(img);
        setImg(img);
        setContent({ text: null, img: formatImg(img), geolocation: null });
    }

    const handleLocation = (lat: number, lng: number) => {
        setGeolocation([lat, lng]);
        setContent({ text: null, img: null, geolocation: { latitude: lat, longitude: lng } });
    }


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
                                {
                                    img && (
                                        <img className='rounded-lg imgPreview ml-24'
                                            src={img}
                                        />
                                    )
                                }
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
