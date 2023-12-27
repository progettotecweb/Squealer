import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";

import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";

import GeolocationSqueal from "./GeolocationSqueal";
import { useSWRConfig } from "swr";
import { useInView } from "react-cool-inview";

function formatDate(date) {
    const d = new Date(date);
    const month = d.getMonth(); //+1
    const day = d.getDate();
    const year = d.getFullYear();
    const hour = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    return day + "/" + month + "/" + year + " " + hour + ":" + minutes;
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
}

const formatText = (text: string) => {
    if (!text) return "";

    // substite mentions with a span with custom class
    const mentions = text.match(/@\w+/g);
    if (mentions)
        mentions.forEach((mention) => {
            text = text.replace(
                mention,
                `<span class="text-blue-400">${mention}</span>`
            );
        });
    // substitute hashtags with a span with custom class
    const hashtags = text.match(/#\w+/g);
    if (hashtags)
        hashtags.forEach((hashtag) => {
            text = text.replace(
                hashtag,
                `<span class="text-blue-400">${hashtag}</span>`
            );
        });

    return text;
};

const SquealText = (props: { text: string }) => {
    return (
        <Typography variant="body2" className="text-lg">
            <div dangerouslySetInnerHTML={{ __html: formatText(props.text) }} />
        </Typography>
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
}) => {
    const [reactions_, setReactions] = useState(reactions);

    const { data: session } = useSession();

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
            className={` mx-2 bg-slate-800 text-slate-50 shadow-none ${className}`}
            ref={observe}
        >
            <CardHeader
                disableTypography
                avatar={
                    <Avatar
                        aria-label="recipe"
                        className="bg-[#111B21] text-slate-50"
                    >
                        <img
                            src={`data:${owner?.img.mimetype};base64,${owner?.img.blob}`}
                        />
                    </Avatar>
                }
                title={
                    <Typography className="mr-auto">@{owner?.name}</Typography>
                }
                subheader={<Typography>{formatDate(date)}</Typography>}
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
                className="text-slate-50 fill-slate-50 p-0"
                disableSpacing
            >
                <SquealButton
                    onClick={() =>
                        updateSquealReaction(id, "m2", session?.user.id)
                    }
                >
                    😡 {reactions_.m2}
                </SquealButton>
                <SquealButton
                    onClick={() =>
                        updateSquealReaction(id, "m1", session?.user.id)
                    }
                >
                    😒 {reactions_.m1}
                </SquealButton>
                <SquealButton
                    onClick={() =>
                        updateSquealReaction(id, "p1", session?.user.id)
                    }
                >
                    😄 {reactions_.p1}
                </SquealButton>
                <SquealButton
                    onClick={() =>
                        updateSquealReaction(id, "p2", session?.user.id)
                    }
                >
                    😝 {reactions_.p2}
                </SquealButton>

                <div className="ml-auto">
                    impressions: {squealData?.impressions}
                </div>
            </CardActions>
            {!squealData.isAReply && (
                <SquealReplyier session={session} parent={squealData} />
            )}
            <div className="flex flex-row p-2">
                <div className="border-l-2 border-l-solid" />
                <section className="flex flex-col gap-2">
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
                recipients: [...props.parent.recipients],
                isAReply: true,
                replyingTo: props.parent._id,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => {
            mutate(`/api/squeals/${props.session.user.id}`);
        });

        setReply("");
    };

    return (
        <CardActions>
            <input
                className="w-full bg-slate-700 rounded-md text-slate-50 p-2"
                placeholder="Reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
            />
            <SquealButton
                aria-label="share"
                className="ml-auto"
                onClick={() => {
                    submitReply();
                }}
            >
                <ReplyOutlinedIcon className="text-slate-50" />
            </SquealButton>
        </CardActions>
    );
};

const SquealButton = (props: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) => {
    return (
        <motion.div whileHover={{ scale: 1.1 }} className={props.className}>
            <IconButton className="text-slate-50" onClick={props.onClick}>
                {props.children}
            </IconButton>
        </motion.div>
    );
};

export default Squeal;
