import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSWR, { Fetcher } from "swr";

const Searchbar: React.FC = () => {
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

    interface SearchResults {
        results: any[];
    }

    const fetcher: Fetcher<SearchResults, string> = (...args) =>
        fetch(...args).then((res) => res.json());

    const [query, setQuery] = useState<string>("");
    const [debouncedQuery, setDebouncedQuery] = useState<string>("");
    const { data, isLoading, mutate, error } = useSWR<SearchResults>(
        () => (debouncedQuery === "" ? null : `/api/search?q=${debouncedQuery.replace(/#/g, "%23")}`),
        fetcher
    );

    const onChange = useCallback(({ target: { value } }) => {
        setQuery(value);
        mutate();
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedQuery(query);
        }, 250);

        return () => {
            clearTimeout(timerId);
        };
    }, [query]);

    if (error) {
        return <div className="flex flex-col items-center">Error</div>;
    }

    return (
        <motion.div
            className="flex flex-col justify-center items-center w-full px-5 py-10 bg-gray-500"
            layout
        >
            <form className="w-full" name="searchbar">
                <input
                    onChange={onChange}
                    autoFocus
                    type="search"
                    name="search"
                    className="rounded-lg p-2 w-full text-zinc-950"
                    placeholder="Search users, channels, keywords"
                />
            </form>
            <AnimatePresence mode="wait">
                {data?.results.map((result, i) => {
                    return (
                        <motion.div
                            key={i}
                            variants={resultsVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {result.name}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
};

export default Searchbar;
