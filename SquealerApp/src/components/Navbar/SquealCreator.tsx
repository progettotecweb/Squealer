import { useRef, useState } from "react";

import Tabs, { Tab, AnimatedTabContent } from "@/components/Tabs/Tabs";
import { AnimatePresence, motion } from "framer-motion";
import AsyncSelect from "react-select/async";
import { useSession } from "next-auth/react";
import Camera from "./Camera";
import Geolocation from "./Geolocation";
import useSWR, { useSWRConfig } from "swr";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Squeal, { SquealSkeleton } from "../Squeal/Squeal";

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

    const [disabled, setDisabled] = useState<boolean>(false);

    const fetcher = (url: string) =>
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (
                    data.msg_quota.debt.daily < 0 ||
                    data.msg_quota.debt.weekly < 0 ||
                    data.msg_quota.debt.monthly < 0
                ) {
                    setError(
                        "You have a debt of " +
                            -data.msg_quota.debt.daily +
                            " daily, " +
                            -data.msg_quota.debt.weekly +
                            " weekly and " +
                            -data.msg_quota.debt.monthly +
                            " monthly characters"
                    );
                    setDisabled(true);
                }

                return data;
            });

    const { data: user } = useSWR(
        session ? `/api/users/${session?.user.id}` : null,
        fetcher
    );

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

        setImg(null);
        setVideo(null);
        setGeolocation(null);
        setMessage("");
        setContent({
            text: null,
            img: null,
            video: null,
            geolocation: null,
        });
    };

    const [squealPostStatus, setSquealPostedLoading] =
        useState<string>("not-posted");

    const [newSqueal, setNewSqueal] = useState<any>(null);
    const [error, setError] = useState<string>("");

    const submitSqueal = async (e) => {
        e.preventDefault();

        if (disabled) {
            return;
        }

        if (
            content.text === null &&
            content.img === null &&
            content.video === null &&
            content.geolocation === null
        ) {
            return;
        }
        setSquealPostedLoading("posting");

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
        })
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                if (!res.success) {
                    setError(res.error);
                    setSquealPostedLoading("not-posted");
                    return;
                }

                setNewSqueal(res.squeal);
                setSquealPostedLoading("posted");
                mutate(`/api/users/${session?.user.id}`);
            });

        setMessage("");
        setContent({
            text: null,
            img: null,
            video: null,
            geolocation: null,
        });
        setImg(null);
        setVideo(null);
        setGeolocation(null);
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
                //check if upload was empty
                if (!e.target.files[0]) {
                    break;
                }

                //check if file uploaded is an image
                if (!e.target.files[0].type.startsWith("image")) {
                    alert("File must be an image");
                } else {
                    await handleImg(e.target, true);
                }
                break;
            case "video":
                //check if upload was empty
                if (!e.target.files[0]) {
                    break;
                }

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

    const [cameraError, setCameraError] = useState(false);
    const handleCameraError = (err: boolean) => {
        setCameraError(err);
    };

    const inputImgRef = useRef<any>(null);
    const inputVideoRef = useRef<any>(null);

    const handleCapture = (img: string) => {
        console.log(img);
        setImg(img);
        setContent({
            text: null,
            img: formatImg(img),
            video: null,
            geolocation: null,
        });

        //reset input field
        if (inputImgRef.current) {
            inputImgRef.current.value = null;
        }
        if (inputVideoRef.current) {
            inputVideoRef.current.value = null;
        }
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

    const getContentSize = () => {
        if (type === "text") return message.length;

        return 125;
    };

    return (
        <>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex flex-col h-full w-full bg-gray-500 p-4 md:bg-[#111B21]">
                <div className="flex flex-col">
                    <Counter
                        quota={user?.msg_quota?.daily}
                        length={getContentSize()}
                        maxLength={1000}
                    />
                    <Counter
                        quota={user?.msg_quota?.weekly}
                        length={getContentSize()}
                        maxLength={6000}
                    />
                    <Counter
                        quota={user?.msg_quota?.monthly}
                        length={getContentSize()}
                        maxLength={24000}
                    />
                </div>
                <AsyncSelect
                    className="text-gray-800"
                    isMulti
                    placeholder="Select recipients..."
                    cacheOptions
                    value={selected}
                    onChange={onChange}
                    onInputChange={(inputValue) => {
                        setQuery(inputValue);
                    }}
                    isDisabled={disabled}
                    loadOptions={async (inputValue) => {
                        const res = await fetch(`/api/search?q=${encodeURIComponent(inputValue)}`);
                        const data = await res.json();
                        console.log(inputValue);
                        return data.results.map((res) => {
                            return {
                                value: {
                                    type: inputValue.startsWith("@")
                                        ? "User"
                                        : inputValue.startsWith("§")
                                        ? "Channel"
                                        : inputValue.startsWith("#")
                                        ? "Keyword"
                                        : "",
                                    id: res._id,
                                    name: inputValue.startsWith("#") ? inputValue.slice(1) : undefined
                                },
                                label:
                                    (inputValue.startsWith("@")
                                        ? "@"
                                        : inputValue.startsWith("§")
                                        ? "§"
                                        : inputValue.startsWith("#")
                                        ? "#"
                                        : "") + res.name,
                            };
                        });
                    }}
                />
                <Tabs onTabChange={handleTabChange}>
                    <Tab
                        label="Text"
                        content={
                            <AnimatedTabContent>
                                <form
                                    name="squeal-post"
                                    className=""
                                    id="squeal-post"
                                >
                                    <input
                                        type="checkbox"
                                        id="repeat"
                                        name="repeat"
                                        checked={repeatMessage}
                                        onChange={() =>
                                            setRepeatMessage(!repeatMessage)
                                        }
                                    />
                                    <label htmlFor="repeat">Repeat</label>
                                    {repeatMessage && (
                                        <div>
                                            <input
                                                type="text"
                                                id="repeat-cron-expr"
                                                name="repeat"
                                                placeholder="Cron job"
                                                value={repetitionExpr}
                                                onChange={(e) => {
                                                    setRepetitionExpr(
                                                        e.target.value
                                                    );
                                                }}
                                                className="text-gray-700"
                                            />
                                            <label htmlFor="repeat">
                                                Cron job
                                            </label>
                                        </div>
                                    )}
                                    <motion.textarea
                                        //onChange={(e) => { setMessage(e.target.value) }}
                                        onChange={handleContent}
                                        value={message}
                                        id="message"
                                        rows={4}
                                        className="block p-2.5 w-full text-sm bg-gray-600 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="What's happening?"
                                        disabled={disabled}
                                    ></motion.textarea>
                                </form>
                            </AnimatedTabContent>
                        }
                    />
                    <Tab
                        label="Image"
                        content={
                            <AnimatedTabContent>
                                {cameraError && !img && (
                                    <p className="text-red-500">
                                        Camera not found
                                    </p>
                                )}
                                <div className="flex justify-center">
                                    <Camera
                                        onCapture={handleCapture}
                                        error={handleCameraError}
                                    />
                                    {img && (
                                        <img
                                            className="rounded-lg imgPreview"
                                            src={img}
                                        />
                                    )}
                                </div>

                                {!cameraError && (
                                    <p className="mt-4 mb-4">OR</p>
                                )}
                                <div className="flex justify-center w-full">
                                    <input
                                        ref={inputImgRef}
                                        className="md:h-[10vh] w-min"
                                        accept="image/*"
                                        id="icon-button-file imginputref"
                                        type="file"
                                        onChange={(e) => {
                                            handleContent(e);
                                        }}
                                    />
                                </div>
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
                                            className="rounded-lg imgPreview"
                                            src={video}
                                            controls={true}
                                        />
                                    )}
                                </div>
                                <div className="flex justify-center w-full">
                                    <input
                                        ref={inputVideoRef}
                                        className="md:h-[10vh] w-min"
                                        accept="video/*"
                                        id="icon-button-file videoinputref"
                                        type="file"
                                        onChange={(e) => {
                                            handleContent(e);
                                        }}
                                    />
                                </div>
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
                        className="items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                        onClick={submitSqueal}
                    >
                        Post
                    </button>
                </div>
            </div>
            <div>
                {squealPostStatus === "posting" ? (
                    <SquealSkeleton />
                ) : squealPostStatus === "posted" ? (
                    <Squeal
                        squealData={newSqueal}
                        type={newSqueal.type}
                        id={newSqueal._id}
                        content={newSqueal.content}
                        owner={newSqueal?.ownerID}
                        date={newSqueal?.datetime}
                        reactions={newSqueal?.reactions}
                        recipients={newSqueal?.recipients}
                    />
                ) : (
                    ""
                )}
            </div>
        </>
    );
};

export const Counter = (props: {
    quota: number;
    length: number;
    maxLength: number;
}) => {
    return (
        <div className=" text-gray-50 flex justify-center gap-1">
            <motion.span
                layout
                className={`${props.length > 0 ? "text-gray-400" : ""}`}
            >
                {props.quota}
            </motion.span>
            <AnimatePresence mode="popLayout">
                {props.length > 0 && (
                    <motion.span
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ArrowForwardIcon />
                        {props.quota - props.length}
                    </motion.span>
                )}
            </AnimatePresence>
            <motion.span layout> / </motion.span>
            <motion.span layout>{props.maxLength}</motion.span>
        </div>
    );
};

export default SquealCreator;
