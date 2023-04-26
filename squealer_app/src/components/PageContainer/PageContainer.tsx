import {motion} from "framer-motion"

let easing = [0.6, -0.05, 0.01, 0.99];

const fadeInUp = {
    initial: {
        y: 60,
        opacity: 0,
        transition: { duration: 0.6, ease: easing }
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: easing
        }
    }
};

export interface PageContainerProps {
	className?: string
	children: React.ReactNode
}

export const PageContainer : React.FC<PageContainerProps> = ({children, className}) => {
	return (
		<motion.div variants={fadeInUp} 
                    initial='initial' 
                    animate='animate' 
                    exit={{opacity: 0}}
                    style={{
                        overflow: "hidden"
                    }}
					className={className}
            >
				{children}
			</motion.div>
	)
}