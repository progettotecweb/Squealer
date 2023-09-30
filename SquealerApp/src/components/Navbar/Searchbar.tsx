
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSWR, {Fetcher} from "swr";

const Searchbar: React.FC = () => {
    const resultsVariants = {
        hidden: {
            opacity: 0,
            y: -100,
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
            y: -100,
        },
    };

    interface SearchResults {
        results: any[]
    }

    const fetcher: Fetcher<SearchResults, string > = (...args) => fetch(...args).then((res) => res.json())
    
    const [query, setQuery] = useState<string>();
    const {data, mutate, error} = useSWR<SearchResults>(`/api/search?q=${query}`, fetcher)

    if(error) {
        return <div className="flex flex-col items-center">Error</div>
    }

    const SearchbarResults: React.FC<{ results: any[] }> = ({
        results,
    }) => {
        return (
            <motion.div
                className="flex flex-col items-center"
                variants={resultsVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {results.map((result, i) => {
                        return (
                            <motion.div
                                key={i}
                                variants={resultsVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                {result}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <motion.div className="flex flex-col justify-center items-center w-full px-5 py-10 bg-gray-500">
            <form className="w-full" name="searchbar">
                <input
                    onChange={(e) => {setQuery(e.target.value);mutate()}}
                    autoFocus
                    type="search"
                    name="search"
                    className="rounded-lg p-2 w-full text-zinc-950"
                    placeholder="Search users, channels, keywords"
                />
            </form>
            <SearchbarResults results={data?.results ?? []} />
        </motion.div>
    );
};

export default Searchbar;