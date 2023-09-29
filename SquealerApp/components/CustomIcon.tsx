import { ReactElement } from "react";
import { motion } from "framer-motion";

interface CustomIconProps {
  icon: ReactElement;
  onClick?: () => void;
}

const CustomIcon: React.FC<CustomIconProps> = ({ icon, onClick }) => {
    return <motion.div onClick={onClick} >{icon}</motion.div>;
};

export default CustomIcon;
