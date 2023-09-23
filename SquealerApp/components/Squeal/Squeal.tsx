import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";


export interface SquealProps {}

const Squeal: React.FC<SquealProps> = ({}) => {
  return (
    <Card className=" mx-2 bg-slate-800 text-slate-50">
      <CardHeader
	  	disableTypography
	  	avatar={<Avatar aria-label="recipe" className="bg-slate-700 text-slate-50">R</Avatar>}
        title={<Typography className="mr-auto">@username</Typography>}
        subheader={<Typography>time - place</Typography>}
      />
      <CardContent>
        <Typography variant="body2">
          This impressive paella is a perfect party dish and a fun meal to cook
          together with your guests. Add 1 cup of frozen peas along with the
          mussels, if you like.
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
