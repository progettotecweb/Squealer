//Divider component
interface DividerProps {
    className?: string;
}

const Divider: React.FC<DividerProps> = ({ className }) => {
    return (
        <div
            className={`border border-stone-200 border-opacity-10 ${className}`}
        />
    );
};

export default Divider;