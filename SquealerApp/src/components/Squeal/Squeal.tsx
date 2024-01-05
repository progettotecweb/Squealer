import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";

import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";

import GeolocationSqueal from "./GeolocationSqueal";
import { useSWRConfig } from "swr";
import { useInView } from "react-cool-inview";
import { Skeleton } from "@mui/material";
import CustomLink from "../CustomLink";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import regexifyString from "regexify-string";
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
        <Typography variant="body2" className="text-lg">
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
        </Typography>
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
        <Card
            className={` mx-2 bg-gray-800 text-gray-50 shadow-none ${className}`}
            ref={observe}
        >
            <div className="flex flex-row p-2 gap-2">
                {recipients?.map((recipient, index) => {
                    return (
                        <span className="text-blue-400 bg-gray-700 p-2 rounded-xl " key={index}>
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
            <CardHeader
                disableTypography
                avatar={
                    <Avatar
                        aria-label="recipe"
                        className="bg-[#111B21] text-gray-50"
                    >
                        <img
                            src={`data:${owner?.img.mimetype};base64,${owner?.img.blob}`}
                        />
                    </Avatar>
                }
                title={
                    <CustomLink href={`/Users/${owner?.name}`}>
                        <Typography className="mr-auto">
                            @{owner?.name}
                        </Typography>
                    </CustomLink>
                }
                subheader={
                    <Typography className="text-gray-400">
                        {formatDate(date)}
                    </Typography>
                }
            />
            <CardContent className="text-left">
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
            </CardContent>
            <CardActions
                className="text-gray-50 fill-slate-50 p-0"
                disableSpacing
            >
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
            </CardActions>
            {!squealData.isAReply && (
                <SquealReplyier session={session} parent={squealData} />
            )}
            <div className="flex flex-row p-2 w-full">
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
                            className="w-full"
                        />
                    ))}
                </section>
            </div>
        </Card>
    );
};

const SquealReplyier = (props: { parent; session }) => {
    const [reply, setReply] = useState("");
    const { mutate } = useSWRConfig();

    const submitReply = () => {
        console.log(props.parent.recipients);
        fetch("/api/squeals/post", {
            method: "POST",
            body: JSON.stringify({
                ownerID: props.session?.user.id,
                type: "text",
                content: {
                    text: reply,
                    img: null,
                    video: null,
                    geolocation: null,
                },
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
        });

        setReply("");
    };

    return (
        <CardActions>
            <input
                className="w-full bg-gray-700 rounded-md text-gray-50 p-2"
                placeholder="Reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                disabled={!props.session}
            />
            <SquealButton
                disabled={!props.session}
                aria-label="share"
                className="ml-auto"
                onClick={() => {
                    submitReply();
                }}
            >
                <ReplyOutlinedIcon className="text-gray-50" />
            </SquealButton>
        </CardActions>
    );
};

const SquealButton = (props: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}) => {
    return (
        <motion.div whileHover={{ scale: 1.1 }} className={props.className}>
            <IconButton
                className="text-gray-50 disabled:text-gray-50"
                onClick={props.onClick}
                disabled={props.disabled}
            >
                {props.children}
            </IconButton>
        </motion.div>
    );
};

export default Squeal;
