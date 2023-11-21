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
    type?: "text" | "image" | "geolocation";
    content?: {
        text: string | null;
        img: string | null;
        geolocation: string | null;
    }
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
}

const Squeal: React.FC<SquealProps> = ({ type, content, owner, date, reactions, id }) => {

    const [reactions_, setReactions] = useState(reactions);

    const { data: session } = useSession();

    const updateSquealReaction = (id: string, reaction: string, userid?: string) => {
        fetch(`/api/squeals/reaction/${id}`, {
            method: "PUT",
            body: JSON.stringify({ reaction, userid }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => res.json()).then((data) => {
            if (data.success) setReactions(data.squeal.reactions);
        })
    }

    return (
        <Card className=" mx-2 bg-slate-800 text-slate-50">
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
            <CardContent>

                <Typography variant="body2">{content?.text}</Typography>
            </CardContent>
            <CardActions className="text-slate-50 fill-slate-50" disableSpacing>
                <SquealButton onClick={() => updateSquealReaction(id, "m2", session?.user.id)}>😡 {reactions_.m2}</SquealButton>
                <SquealButton onClick={() => updateSquealReaction(id, "m1", session?.user.id)}>😒 {reactions_.m1}</SquealButton>
                <SquealButton onClick={() => updateSquealReaction(id, "p1", session?.user.id)}>😄 {reactions_.p1}</SquealButton>
                <SquealButton onClick={() => updateSquealReaction(id, "p2", session?.user.id)}>😝 {reactions_.p2}</SquealButton>
                <IconButton aria-label="share" className="ml-auto">
                    <ReplyOutlinedIcon className="text-slate-50" />
                </IconButton>
            </CardActions>
        </Card>
    );
};



const SquealButton = (props: { children: React.ReactNode, onClick?: () => void }) => {
    return (
        <motion.div whileHover={{ scale: 1.1 }}>
            <IconButton className="text-slate-50" onClick={props.onClick}>
                {props.children}
            </IconButton>
        </motion.div>
    )
}

export default Squeal;
