import Divider from "@/components/Divider";
import CustomIcon from "../CustomIcon";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSWR, { Fetcher } from "swr";
import CustomLink from "../CustomLink";

const getRecents = () => {
    return JSON.parse(localStorage.getItem("recents") as string);
};

const clearRecents = () => {
    localStorage.removeItem("recents");
};

const setNewRecent = (recent: any) => {
    const recents = getRecents();
    if (recents) {
        // if already present, put it at the top
        const index = recents.indexOf(recent);
        if (index !== -1) {
            recents.splice(index, 1);
        }

        // if more than 5 recents, remove the oldest one
        if (recents.length >= 5) {
            recents.pop();
        }
        recents.unshift(recent);
        localStorage.setItem("recents", JSON.stringify(recents));
    } else {
        localStorage.setItem("recents", JSON.stringify([recent]));
    }
};

const resultsVariants = {
    hidden: {
        opacity: 0,
        y: -1,
    },
    visible: {
        opacity: 1,
        y: 0,
        height: "auto",
        transition: {
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        y: -1,
    },
};

export default function SearchMenu() {
    interface SearchResults {
        results: any[];
    }

    const fetcher: Fetcher<SearchResults, string> = (...args) =>
        fetch(...args).then((res) => res.json());

    const [query, setQuery] = useState<string>("");
    const [debouncedQuery, setDebouncedQuery] = useState<string>("");
    const { data, isLoading, mutate, error } = useSWR<SearchResults>(
        () =>
            debouncedQuery === ""
                ? null
                : `/api/search?q=${debouncedQuery.replace(/#/g, "%23")}`,
        fetcher
    );

    const onChange = useCallback((e: any) => {
        setQuery(e.target.value);
        mutate();
    }, []);

    const onSubmit = (e: any) => {
        e.preventDefault();
        setNewRecent(query);
        setTrigger(true);
        mutate();
    };

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [query]);

    const [recents, setRecents] = useState<any[]>([]);
    const [trigger, setTrigger] = useState<boolean>(false);

    useEffect(() => {
        if (trigger) {
            setRecents(getRecents());
            setTrigger(false);
        }
    }, [trigger]);

    useEffect(() => {
        setRecents(getRecents());
    }, [])

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-xl">Search</h1>

            <div className="p-2 bg-gray-700 rounded-lg flex flex-row">
                <form onSubmit={onSubmit} name="search-menu">
                    <input
                        type="text"
                        placeholder="Search"
                        className="bg-inherit focus-within:outline-none w-full"
                        value={query}
                        onChange={onChange}
                        autoFocus
                    />
                </form>
                <CustomIcon
                    icon={<CloseOutlinedIcon />}
                    onClick={() => setQuery("")}
                />
            </div>

            <Divider />

            <AnimatePresence mode="wait">
                {query === "" ? (
                    <motion.div
                        variants={resultsVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        key="recents"
                    >
                        <div className="flex flex-row items-center mb-1">
                            <h1 className="text-ld flex-1">Recents</h1>
                            <CustomIcon
                                icon={<CloseOutlinedIcon />}
                                onClick={() => {
                                    clearRecents();
                                    setTrigger(true);
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            {recents?.map((recent: any) => {
                                return (
                                    <div
                                        className="flex flex-row gap-2 cursor-pointer hover:bg-gray-700 rounded-lg p-1"
                                        onClick={() => setQuery(recent)}
                                    >
                                        <p>{recent}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={resultsVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        key="results"
                    >
                        {data?.results.map((result, i) => {
                            return (
                                <CustomLink href={`/${query.startsWith("@") ? "Users" : "Channels" }/${result.name}`} key={i}>
                                    <motion.div
                                        key={i}
                                        variants={resultsVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="flex flex-row gap-2 cursor-pointer hover:bg-gray-700 rounded-lg p-1"
                                        onClick={() => {
                                            setNewRecent(result.name);
                                            setTrigger(true);
                                        }}
                                    >
                                        {result.name}
                                    </motion.div>
                                </CustomLink>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
