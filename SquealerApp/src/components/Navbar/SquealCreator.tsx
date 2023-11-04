import { useState } from "react";

import Tabs, { Tab, AnimatedTabContent } from "@/components/Tabs/Tabs";
import { AnimatePresence, motion } from "framer-motion";
import useSWR, { Fetcher } from "swr";
import AsyncSelect from "react-select/async";
import { set } from "mongoose";
import { useSession } from "next-auth/react";

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

const SquealCreator = () => {
    const [message, setMessage] = useState("");
    const [query, setQuery] = useState<string>("");
    const { data: session } = useSession();

    const submitSqueal = async (e) => {
        e.preventDefault();
        fetch("/api/squeals/post", {
            method: "POST",
            body: JSON.stringify({
                ownerID: session?.user.id,
                content: message,
                recipients: selected.map((res) => res.value),
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        setMessage("");
        setSelected([]);
        setQuery("");
    };

    const [selected, setSelected] = useState<any[]>([]);

    const onChange = (data) => {
        setSelected(data);
        setQuery("");
    };

    return (
        <div className="flex flex-col h-full w-full bg-grey-500 p-4 md:bg-[#111B21] md:rounded-lg md:mb-2">
            <AsyncSelect
                isMulti
                cacheOptions
                value={selected}
                onChange={onChange}
                onInputChange={(inputValue) => {
                    setQuery(inputValue);
                }}
                loadOptions={async (inputValue) => {
                    const res = await fetch(`/api/search?q=${inputValue}`);
                    const data = await res.json();
                    return data.results.map((res) => {
                        return {
                            value: {
                                type: query.startsWith("@")
                                    ? "user"
                                    : "channel",
                                id: res.id,
                            },
                            label: res.name,
                        };
                    });
                }}
            />

            <Counter current_len={message.length} />
            <Tabs>
                <Tab
                    label="Text"
                    content={
                        <AnimatedTabContent>
                            <form name="squeal-post" className="md:h-[10vh]">
                                <motion.textarea
                                    maxLength={MAX_LEN}
                                    onChange={(e) => setMessage(e.target.value)}
                                    value={message}
                                    id="message"
                                    rows={4}
                                    className="block p-2.5 w-full text-sm bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none"
                                    placeholder="What's happening?"
                                ></motion.textarea>
                            </form>
                        </AnimatedTabContent>
                    }
                />
                <Tab
                    label="Image"
                    content={
                        <AnimatedTabContent>
                            <input
                                className="md:h-[10vh]"
                                accept="image/*"
                                id="icon-button-file"
                                type="file"
                                capture="environment"
                            />
                        </AnimatedTabContent>
                    }
                />
                <Tab
                    label="Geolocation"
                    content={
                        <AnimatedTabContent>
                            <div className="md:h-[10vh]">Geolocation</div>
                        </AnimatedTabContent>
                    }
                />
            </Tabs>
            <div className="flex justify-between items-center mt-4">
                <button
                    type="submit"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={submitSqueal}
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default SquealCreator;
