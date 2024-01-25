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
        img: {
            mimetype: string;
            blob: string;
        } | null;
        geolocation: {
            latitude: number;
            longitude: number;
        };
        video: {
            mimetype: string;
            blob: string;
        } | null;
    };
    owner?: {
        name: string;
        img: {
            mimetype: string;
            blob: string;
        };
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

const SquealText = (props: { text: string }) => {
    return (
        <p className="text-md ml-4 mt-2">
            {regexifyString({
                pattern: /@\w+|#\w+/g,
                decorator: (match, index) => {
                    const link = match.startsWith("@");

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

    return (
        <div
            className={`${className} flex flex-col bg-gray-800 text-gray-50 shadow-none mx-2 p-4 rounded-md gap-2 `}
            ref={observe}
        >
            <div className="flex flex-row gap-2 text-md flex-wrap">
                {recipients?.map((recipient, index) => {
                    return (
                        <span
                            className="text-blue-400 bg-gray-700 py-1 px-4 rounded-xl "
                            key={index}
                        >
                            {recipient.type === "Channel"
                                ? "§"
                                : recipient.type === "User"
                                ? "@"
                                : recipient.type === "Keyword"
                                ? "#"
                                : ""}
                            {recipient.name}
                        </span>
                    );
                })}
            </div>
            <div className="flex gap-2 items-center">
                <Avatar
                    aria-label="recipe"
                    className="bg-[#111B21] text-gray-50 border-solid border-2 border-gray-200"
                >
                    <img
                        src={
                            owner
                                ? `data:${owner?.img?.mimetype};base64,${owner?.img?.blob}`
                                : "/deleted.webp"
                        }
                        alt="Profile Picture"
                        className="object-fit w-full h-full"
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
                            if (content?.img && content?.img.blob)
                                return (
                                    <img
                                        src={`data:${content?.img.mimetype};base64,${content?.img.blob}`}
                                        alt="FOTO"
                                        className="max-h-[25vw]"
                                    />
                                );
                            else return;
                        case "video":
                            if (content?.video && content?.video.blob)
                                return (
                                    <video
                                        controls
                                        src={`data:${content?.video.mimetype};base64,${content?.video.blob}`}
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
            <div className="text-gray-50 fill-slate-50 flex items-center text-sm ">
                <SquealButton
                    disabled={status === "unauthenticated"}
                    onClick={() =>
                        updateSquealReaction(id, "m2", session?.user.id)
                    }
                >
                    😡 {reactions_.m2}
                </SquealButton>
                <SquealButton
                    disabled={status === "unauthenticated"}
                    onClick={() =>
                        updateSquealReaction(id, "m1", session?.user.id)
                    }
                >
                    😒 {reactions_.m1}
                </SquealButton>
                <SquealButton
                    disabled={status === "unauthenticated"}
                    onClick={() =>
                        updateSquealReaction(id, "p1", session?.user.id)
                    }
                >
                    😄 {reactions_.p1}
                </SquealButton>
                <SquealButton
                    disabled={status === "unauthenticated"}
                    onClick={() =>
                        updateSquealReaction(id, "p2", session?.user.id)
                    }
                >
                    😝 {reactions_.p2}
                </SquealButton>

                <div className="ml-auto mr-4">
                    {squealData?.impressions} <RemoveRedEyeOutlinedIcon />
                </div>
            </div>
            {!squealData.isAReply && (
                <SquealReplyier session={session} parent={squealData} />
            )}
            {squealData?.replies?.length > 0 && (
                <div className="flex flex-row w-full">
                    <div className="border-l-2 border-l-solid" />
                    <section className="flex flex-col gap-2 w-full">
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
                    </section>
                </div>
            )}
        </div>
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
        }).then((res) => {
            mutate(`/api/squeals/${props.session.user.id}`);
            mutate(`/api/squeals/${props.session.user.id}/feed`);
            switchType("text");
            setLoading(false);
        });
    };

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
            <div className="flex flex-1 bg-gray-700 rounded-md text-gray-50">
                <div className="flex-1">
                    {type === "text" ? (
                        <motion.input
                            name="reply"
                            className="w-full bg-gray-700 rounded-md text-gray-50 p-2 flex-1 reply-input overflow-y-auto break-words resize-none"
                            placeholder="Reply..."
                            value={reply}
                            onChange={(e) => handleContent(e)}
                            disabled={!props.session}
                        />
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
                        type === "text" ? "flex-row" : "flex-col p-4 h-full justify-center gap-4"
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
                        className="ml-auto"
                        //onClick={() => switchType("image")}
                    >
                        {/* </SquealButton><CameraAltOutlinedIcon className="text-gray-50" /> */}
                        <label
                            htmlFor={`icon-button-file imginputref ${props.parent._id}`}
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
                        className="ml-auto"
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
        <motion.div
            whileHover={{ scale: 1.1 }}
            className={`${props.className} text-sm flex items-center`}
        >
            <IconButton
                className="text-gray-50 disabled:text-gray-50 text-md"
                onClick={props.onClick}
                disabled={props.disabled}
            >
                {props.children}
            </IconButton>
        </motion.div>
    );
};

export default Squeal;
