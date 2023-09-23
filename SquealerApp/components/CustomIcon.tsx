import { ReactElement } from "react";
import { motion } from "framer-motion";

interface CustomIconProps {
  icon: ReactElement;
  onClick?: () => void;
}

const CustomIcon: React.FC<CustomIconProps> = ({ icon, onClick }) => {
    return <motion.div onTap={onClick} whileHover={{ scale: 1.3 }}>{icon}</motion.div>;
};

export default CustomIcon;
