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

export interface SquealProps {}

const Squeal: React.FC<SquealProps> = ({}) => {
    return (
        <Card className=" mx-2 bg-slate-800 text-slate-50">
            <CardHeader
                disableTypography
                avatar={
                    <Avatar
                        aria-label="recipe"
                        className="bg-[#111B21] text-slate-50"
                    >
                        R
                    </Avatar>
                }
                title={<Typography className="mr-auto">@username</Typography>}
                subheader={<Typography>time - place</Typography>}
            />
            <CardContent>
                <Typography variant="body2">
                    This impressive paella is a perfect party dish and a fun
                    meal to cook together with your guests. Add 1 cup of frozen
                    peas along with the mussels, if you like.
                </Typography>
            </CardContent>
            <CardActions className="text-slate-50 fill-slate-50" disableSpacing>
                <IconButton aria-label="share">
                    <ThumbUpAltOutlinedIcon className="text-slate-50" />
                </IconButton>
                <IconButton aria-label="share">
                    <ThumbDownOffAltOutlinedIcon className="text-slate-50" />
                </IconButton>
                <IconButton aria-label="share" className="ml-auto">
                    <ReplyOutlinedIcon className="text-slate-50" />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default Squeal;
