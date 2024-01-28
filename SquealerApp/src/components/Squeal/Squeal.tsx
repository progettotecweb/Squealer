import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";

import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import GeolocationSqueal from "./GeolocationSqueal";
import useSWR, { useSWRConfig } from "swr";
import { useInView } from "react-cool-inview";
import { Skeleton } from "@mui/material";
import CustomLink from "../CustomLink";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import regexifyString from "regexify-string";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import KeyboardAltOutlinedIcon from "@mui/icons-material/KeyboardAltOutlined";
import Spinner from "../Spinner";

import Geolocation from "../Navbar/Geolocation";
import { Counter } from "../Navbar/SquealCreator";
import Link from "next/link";

function formatDate(date) {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString(); //+1
    const day = d.getDate().toString().padStart(2, "0");
    const year = d.getFullYear();
    const hour = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const seconds = d.getSeconds();

    return (
        day +
        "/" +
        month.padStart(2, "0") +
        "/" +
        year +
        " " +
        hour +
        ":" +
        minutes
    );
}

export interface SquealProps {
    id: string;
    type?: "text" | "image" | "video" | "geolocation";
    content: {
        text: string | null;
        img: string | null;
        geolocation: {
            latitude: number;
            longitude: number;
        };
        video: string | null;
    };
    owner?: {
        name: string;
        img: string;
    };
    date: string;
    reactions: {
        m2: number;
        m1: number;
        p1: number;
        p2: number;
    };
    squealData: any;
    className?: string;
    recipients?: [
        {
            name: string;
            id: string;
            type: "Channel" | "User" | "Keyword";
        }
    ];
}

//find $URL=<url> in text, substitute it with <a> tag

const SquealText = (props: { text: string }) => {
    return (
        <p className="text-md ml-4 mt-2">
            {regexifyString({
                pattern: /@\w+|#\w+|(\[(.*?)\])?\$URL=(\S+)/g,
                decorator: (match, index) => {
                    const link = match.startsWith("@");

                    if (match.includes("$URL=")) {
                        const [text, url] = match.split("$URL=");
                        const displayText = text.replace(/[\[\]]/g, "");

                        return (
                            <a
                                href={url}
                                rel="noopener"
                                target="_blank"
                                key={"url" + index}
                                className="text-blue-400 hover:text-blue-500"
                            >
                                {displayText || "More"}
                            </a>
                        );
                    }

                    return link ? (
                        <CustomLink
                            href={`/Users/${match.slice(1)}`}
                            key={index}
                            outerComponent="span"
                            className="text-blue-400"
                        >
                            {match}
                        </CustomLink>
                    ) : (
                        <span key={index} className="text-blue-400">
                            {match}
                        </span>
                    );
                },
                input: props.text,
            })}
        </p>
    );
};

export const SquealSkeleton = () => {
    return (
        <Card className={" mx-2 bg-gray-800 text-gray-50 shadow-none"}>
            <CardHeader
                avatar={
                    <Skeleton
                        variant="circular"
                        animation="wave"
                        height={32}
                        width={32}
                    />
                }
                title={
                    <Skeleton
                        variant="text"
                        animation="wave"
                        className="w-[40%]"
                    />
                }
                subheader={
                    <Skeleton
                        variant="text"
                        animation="wave"
                        className="w-[25%]"
                    />
                }
            />
            <CardContent>
                <Skeleton variant="rectangular" animation="wave" height={80} />
                <Skeleton animation="wave" />
            </CardContent>
        </Card>
    );
};

const Squeal: React.FC<SquealProps> = ({
    type,
    content,
    owner,
    date,
    reactions,
    id,
    squealData,
    className,
    recipients,
}) => {
    const [reactions_, setReactions] = useState(reactions);

    const { data: session, status } = useSession();

    const { observe } = useInView({
        threshold: [0.2, 0.4, 0.6, 0.8, 1],
        onEnter: ({ unobserve }) => {
            unobserve();
            //retrieve array of viewed squeals from sessionStorage
            //if it doesn't exist, create it
            //if it does exist, check if the current squeal is in it

            //if it is, do nothing
            //if it isn't, add it to the array and update sessionStorage
            if (!sessionStorage.getItem("views"))
                sessionStorage.setItem("views", JSON.stringify([]));

            if (sessionStorage.getItem("views")) {
                const views = JSON.parse(
                    sessionStorage.getItem("views") as string
                );
                if (!views.includes(id)) {
                    views.push(id);
                    sessionStorage.setItem("views", JSON.stringify(views));

                    fetch(`/api/squeals/${id}/view`, {
                        method: "POST",
                        body: JSON.stringify({ userid: session?.user.id }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            if (data.status === 200) console.log("Viewed!");
                        });
                }
            }
        },
    });

    const updateSquealReaction = (
        id: string,
        reaction: string,
        userid?: string
    ) => {
        fetch(`/api/squeals/reaction/${id}`, {
            method: "PUT",
            body: JSON.stringify({ reaction, userid }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setReactions(data.squeal.reactions);
            });
    };

    const computeHref = (type, name) => {
        switch (type) {
            case "Channel":
                return `/Channels/${name}`;
            case "User":
                return `/Users/${name}`;
            case "Keyword":
                return `/Channels/${name}`;
            default:
                return "";
        }
    };

    return (
        <motion.div
            className={`${className} flex flex-col bg-gray-800 text-gray-50 shadow-none mx-2 p-4 rounded-md gap-2 `}
            ref={observe}
            layout
        >
            <div className="flex flex-row gap-2 text-md flex-wrap">
                {recipients?.map((recipient, index) => {
                    return (
                        <Link
                            className="text-blue-400 bg-gray-700 py-1 px-4 rounded-xl "
                            key={index}
                            href={computeHref(recipient.type, recipient.name)}
                        >
                            {recipient.type === "Channel"
                                ? "§"
                                : recipient.type === "User"
                                ? "@"
                                : recipient.type === "Keyword"
                                ? "#"
                                : ""}
                            {recipient.name}
                        </Link>
                    );
                })}
            </div>
            <div className="flex gap-2 items-center">
                <Avatar
                    aria-label="recipe"
                    className="bg-[#111B21] text-gray-50"
                >
                    <img
                        src={
                            owner ? `/api/media/${owner?.img}` : "/deleted.webp"
                        }
                        alt="Profile Picture"
                        className="object-cover w-full h-full"
                    />
                </Avatar>
                <div className="flex flex-col items-start">
                    {owner ? (
                        <CustomLink href={`/Users/${owner?.name}`}>
                            <Typography className="mr-auto">
                                @{owner?.name}
                            </Typography>
                        </CustomLink>
                    ) : (
                        <Typography className="mr-auto text-gray-400">
                            user deleted
                        </Typography>
                    )}
                    <Typography className="text-gray-400">
                        {formatDate(date)}
                    </Typography>
                </div>
            </div>
            <div className="text-left">
                {(() => {
                    switch (type) {
                        case "text":
                            return (
                                <SquealText text={content?.text as string} />
                            );
                        case "image":
                            if (content?.img)
                                return (
                                    <img
                                        src={`/api/media/${content?.img}`}
                                        alt="FOTO"
                                        className="max-h-[25vw]"
                                    />
                                );
                            else return;
                        case "video":
                            if (content?.video)
                                return (
                                    <video
                                        controls
                                        src={`/api/media/${content?.video}`}
                                        className="video-squeal h-1/3 w-2/3"
                                    />
                                );
                            else return;
                        case "geolocation":
                            return (
                                <div>
                                    <GeolocationSqueal
                                        geolocation={[
                                            content?.geolocation?.latitude,
                                            content?.geolocation?.longitude,
                                        ]}
                                        squealID={id.toString()}
                                    ></GeolocationSqueal>
                                </div>
                            );
                        default:
                            return;
                    }
                })()}
            </div>
            <div className="text-gray-50 flex items-center gap-4 ">
                <SquealButton
                    disabled={status === "unauthenticated"}
                    onClick={() =>
                        updateSquealReaction(id, "m2", session?.user.id)
                    }
                >
                    <img src="/m2.svg" alt="M2" className="size-12" />{" "}
                    <p>{reactions_.m2}</p>
                </SquealButton>
                <SquealButton
                    disabled={status === "unauthenticated"}
                    onClick={() =>
                        updateSquealReaction(id, "m1", session?.user.id)
                    }
                >
                    <img src="/m1.svg" alt="M2" className="size-12" />{" "}
                    <p>{reactions_.m1}</p>
                </SquealButton>
                <SquealButton
                    disabled={status === "unauthenticated"}
                    onClick={() =>
                        updateSquealReaction(id, "p1", session?.user.id)
                    }
                >
                    <img src="/p1.svg" alt="M2" className="size-12" />{" "}
                    <p>{reactions_.p1}</p>
                </SquealButton>
                <SquealButton
                    disabled={status === "unauthenticated"}
                    onClick={() =>
                        updateSquealReaction(id, "p2", session?.user.id)
                    }
                >
                   <img src="/p2.svg" alt="M2" className="size-12" />{" "}
                    <p>{reactions_.p2}</p>
                </SquealButton>

                <div className="ml-auto text-gray-400 flex items-center gap-1">
                    <p>
                        {squealData?.impressions} 
                        </p>
                        <RemoveRedEyeOutlinedIcon />
                </div>
            </div>
            {!squealData.isAReply && (
                <SquealReplyier session={session} parent={squealData} />
            )}
            {squealData?.replies?.length > 0 && (
                <motion.div className="flex flex-row w-full" layout>
                    <motion.div className="border-l-2 border-l-solid" layout />
                    <motion.section
                        className="flex flex-col gap-2 w-full *:p-1"
                        layout
                    >
                        {squealData?.replies?.map((reply) => (
                            <Squeal
                                key={reply._id}
                                id={reply._id}
                                type={reply.type}
                                content={reply.content}
                                owner={reply.ownerID}
                                date={reply.datetime}
                                reactions={reply.reactions}
                                squealData={reply}
                                className="w-full p-1"
                            />
                        ))}
                    </motion.section>
                </motion.div>
            )}
        </motion.div>
    );
};

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

const SquealReplyier = (props: { parent; session }) => {
    const [reply, setReply] = useState("");
    const { mutate } = useSWRConfig();

    const inputImgRef = useRef<any>(null);

    const [content, setContent] = useState<Content>({
        text: null,
        img: null,
        video: null,
        geolocation: null,
    });

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const [type, setType] = useState<
        "text" | "image" | "video" | "geolocation"
    >("text");

    const submitReply = () => {
        if (type === "text" && reply === "") return;
        if (type === "image" && !content.img) return;

        setLoading(true);
        fetch("/api/squeals/post", {
            method: "POST",
            body: JSON.stringify({
                ownerID: props.session?.user.id,
                type: type,
                content: content,
                //remove _id from recipients
                recipients: [
                    ...props.parent.recipients.map((r) => {
                        return { id: r.id, type: r.type };
                    }),
                ],
                isAReply: true,
                replyingTo: props.parent._id,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) {
                    setError(res.error);
                    return;
                }

                mutate(`/api/squeals/${props.session.user.id}`);
                mutate(`/api/squeals/${props.session.user.id}/feed`);
                switchType("text");
                setLoading(false);
            });
    };20

    const handleContent = async (e: any) => {
        console.log("Firing handleContent - " + type);

        const { name, value } = e.target;
        switch (type) {
            case "text":
                setReply(value);
                setContent({
                    text: value,
                    img: null,
                    video: null,
                    geolocation: null,
                });
                setType("text");
                break;
            case "image":
                //check if upload was empty
                if (e.target.files.length <= 0) {
                    setType("text");
                    break;
                }

                //check if file uploaded is an image
                if (!e.target.files[0].type.startsWith("image")) {
                    alert("File must be an image");
                } else {
                    await handleImg(e.target, true);
                }
                break;
        }
    };

    const [img, setImg] = useState<string | null>(null);

    const handleImg = (file, setContentToUpdate = false) => {
        return new Promise((resolve, reject) => {
            setType("image");
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
                //reject(error); // reject promise if something goes wrong
            };

            reader.readAsDataURL(file.files[0]);
        });
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

    const switchType = (newType) => {
        setType(newType);
        setContent({
            text: null,
            img: null,
            video: null,
            geolocation: null,
        });

        setReply("");
        setImg(null);
    };

    const [geolocation, setGeolocation] = useState<[number, number] | null>(
        null
    );

    const handleLocation = (lat: number, lng: number) => {
        setGeolocation([lat, lng]);
        setContent({
            text: null,
            img: null,
            video: null,
            geolocation: { latitude: lat, longitude: lng },
        });
    };

    const { data: user } = useSWR(
        props.session ? `/api/users/${props.session?.user.id}` : null
    );

    useEffect(() => {
        const inputimg = document.getElementById(
            `icon-button-file imginputref ${props.parent._id}`
        );
        if (inputimg) {
            inputimg.addEventListener("cancel", (e) => {
                switchType("text");
            });
        }

        return () => {
            if (inputimg) {
                inputimg.removeEventListener("cancel", (e) => {
                    switchType("text");
                });
            }
        };
    }, []);

    const isContentEmpty = () => {
        switch (type) {
            case "text":
                return reply === "";
            case "image":
                return !content.img;
            case "video":
                return !content.video;
            case "geolocation":
                return !content.geolocation;
            default:
                return true;
        }
    };

    const getContentSize = () => {
        if (type === "text") return reply.length;

        return 125;
    };

    const slideInFromRight = {
        initial: {
            opacity: 0,
            x: 100,
        },
        animate: {
            opacity: 1,
            x: 0,
        },
        exit: {
            opacity: 0,
            x: 100,
        },
    };

    const handleInputResize = (e) => {
        e.target.style.height = "inherit";
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    return (
        <form className="flex">
            <AnimatePresence>
                {!isContentEmpty() && (
                    <>
                        <div className="sticky top-[1rem] right-[1rem]"></div>
                        <motion.div
                            key="counters"
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={slideInFromRight}
                            className="fixed top-[1rem] right-[1rem] p-4 rounded-lg bg-gray-800 text-slate-50 z-[1200] shadow-md shadow-gray-500"
                        >
                            <h1 className="md:text-xl mb-4">Characters</h1>
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
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {error && (
                <motion.div
                    key="error"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={slideInFromRight}
                    className="fixed top-[1rem] right-[1rem] p-4 rounded-lg bg-gray-800 text-slate-50 z-[1200] shadow-md shadow-gray-500"
                >
                    <h1 className="text-xl mb-4">Error</h1>
                    <p>{error}</p>
                </motion.div>
            )}
            <div className="flex flex-1 bg-gray-700 rounded-md text-gray-50 items-center mr-2">
                <div className="flex-1 flex items-center">
                    {type === "text" ? (
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.textarea
                                name="reply"
                                className="w-full bg-gray-700 rounded-md m-0 text-gray-50 p-2 flex-1 reply-input overflow-hidden break-words resize-none transition-all focus-within:outline-none focus:outline-none outline-none"
                                placeholder="Reply..."
                                value={reply}
                                onChange={(e) => handleContent(e)}
                                disabled={!props.session}
                                wrap="soft"
                                rows={1}
                                onKeyUp={handleInputResize}
                                layout
                                key={"reply_id" + props.parent._id}
                            />
                        </AnimatePresence>
                    ) : type === "image" ? (
                        img && (
                            <div className="flex flex-col gap-2">
                                <img
                                    src={img}
                                    alt="img"
                                    className="max-h-[25vw] rounded-lg imgPreview p-2"
                                />
                            </div>
                        )
                    ) : (
                        type === "geolocation" && (
                            <Geolocation onLocation={handleLocation} />
                        )
                    )}
                </div>
                <div
                    className={`flex ${
                        type === "text"
                            ? "flex-row items-center gap-2 p-2"
                            : "flex-col p-4 h-full justify-center gap-4"
                    }`}
                >
                    {type !== "text" && (
                        <SquealButton
                            disabled={!props.session}
                            aria-label="share"
                            className="ml-auto"
                            onClick={() => switchType("text")}
                        >
                            <KeyboardAltOutlinedIcon className="text-gray-50" />
                        </SquealButton>
                    )}

                    <SquealButton
                        disabled={!props.session}
                        aria-label="share"
                        className=" flex items-center"
                        //onClick={() => switchType("image")}
                    >
                        {/* </SquealButton><CameraAltOutlinedIcon className="text-gray-50" /> */}
                        <label
                            htmlFor={`icon-button-file imginputref ${props.parent._id}`}
                            className=""
                        >
                            <CameraAltOutlinedIcon className="text-gray-50" />
                        </label>
                        <input
                            ref={inputImgRef}
                            accept="image/*"
                            id={`icon-button-file imginputref ${props.parent._id}`}
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                handleImg(e.target, true);
                            }}
                        />
                    </SquealButton>
                    <SquealButton
                        disabled={!props.session}
                        aria-label="share"
                        className=" "
                        onClick={() => {
                            switchType("geolocation");
                        }}
                    >
                        <LocationOnOutlinedIcon className="text-gray-50" />
                    </SquealButton>
                </div>
            </div>
            <SquealButton
                disabled={!props.session || loading}
                aria-label="share"
                className="ml-auto"
                onClick={() => {
                    submitReply();
                }}
            >
                {loading ? (
                    <Spinner />
                ) : (
                    <ReplyOutlinedIcon className="text-gray-50" />
                )}
            </SquealButton>
        </form>
    );
};

const SquealButton = (props: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}) => {
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            className={`text-gray-50 disabled:text-gray-50 flex items-center ${props.className}`}
            onClick={props.onClick}
            disabled={props.disabled}
        >
            {props.children}
        </motion.button>
    );
};

export default Squeal;
