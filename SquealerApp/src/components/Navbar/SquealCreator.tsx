import { useState } from "react";

import CustomIcon from "@/components/CustomIcon";
import CloseOutlined from "@mui/icons-material/CloseOutlined";

const MAX_LEN = 50;

const Counter: React.FC<{ current_len: number }> = ({ current_len }) => {
    const color =
        MAX_LEN - current_len < MAX_LEN ? "text-red-500" : "text-slate-50";

    return (
        <div className="text-center">
            <span className={`${color}`}>{MAX_LEN - current_len}</span>
            <span>/{MAX_LEN}</span>
        </div>
    );
};

interface SquealCreatorProps {
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const SquealCreator: React.FC<SquealCreatorProps> = ({ setOpenDialog }) => {
    const [message, setMessage] = useState("");

    const submitSqueal = async (e) => {
        e.preventDefault();
        fetch("/api/squeal", {
            method: "POST",
            body: JSON.stringify({
                message: message,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-500 p-4">
            <CustomIcon
                icon={<CloseOutlined className="h-8 w-8 text-slate-50" />}
                onClick={() => setOpenDialog(false)}
            />
            <Counter current_len={message.length} />
            <form name="squeal-post">
                <textarea
                    maxLength={MAX_LEN}
                    onChange={(e) => setMessage(e.target.value)}
                    id="message"
                    rows={4}
                    className="block p-2.5 w-full text-sm bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="What's happening?"
                ></textarea>

                <div className="flex justify-between items-center mt-4">
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                        onClick={submitSqueal}
                    >
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SquealCreator;
