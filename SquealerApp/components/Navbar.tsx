import SearchIcon from "@/icons/SearchIcon";
import IconAccountCircle from "@/icons/AccountIcon";
import IconAdd from "@/icons/AddIcon";

import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import CloseOutlined from "@mui/icons-material/CloseOutlined";

import CustomIcon from "@/components/CustomIcon";
import CustomLink from "@/components/CustomLink";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { useDebounce } from "use-debounce";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);

    const Menu = () => {
        return (
            <Box
                sx={{ width: 250 }}
                role="presentation"
                onClick={() => setOpen(false)}
                onKeyDown={() => setOpen(false)}
                className="bg-slate-800 text-slate-50 h-screen p-4 flex flex-col"
            >
                <h1>Full name</h1>
                <h2>@username</h2>
                <Divider light />

                <Container className="flex flex-col flex-1">
                    {["Settings", "Account", "etc."].map((text, index) => (
                        <CustomLink
                            href={`/${text}`}
                            key={index}
                            className="mt-2"
                        >
                            {text}
                        </CustomLink>
                    ))}
                </Container>
                <Divider light />
                <Container className="flex flex-col mt-auto">
                    <CustomLink type="a" href="/SMM" className="mt-2">
                        Switch to SMM
                    </CustomLink>
                    <CustomLink type="a" href="/Moderator" className="mt-2">
                        Switch to Moderator
                    </CustomLink>
                </Container>
            </Box>
        );
    };

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

    const SquealCreator: React.FC = () => {
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
                    onClick={() => setOpenDialog(!openDialog)}
                />
                <Counter current_len={message.length} />
                <form>
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
        const [query, setQuery] = useState<string>();

        const [results, setResults] = useState([]);

        const router = useRouter();

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

        const [value] = useDebounce(query, 500);

        useEffect(() => {
            const getData = async () => {
                const data = await fetch(`/api/search?q=${value}`);
                const res = await data.json();
                setResults(res.results);
            };
            getData();
        }, [value]);

        return (
            <motion.div className="flex flex-col justify-center items-center w-full px-5 py-10 bg-gray-500">
                <form className="w-full" onSubmit={() => router.push("/")}>
                    <input
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        type="search"
                        className="rounded-lg p-2 w-full text-zinc-950"
                        placeholder="Search users, channels, keywords"
                    />
                </form>
                <SearchbarResults results={results} />
            </motion.div>
        );
    };

    return (
        <>
            <nav className="fixed bottom-0 h-16 bg-[#111B21] w-full flex justify-evenly items-center md:hidden">
                <CustomIcon
                    icon={<SearchIcon className="h-8 w-8 text-slate-50" />}
                    onClick={() => setOpenSearch(!openSearch)}
                />
                <CustomIcon
                    icon={<IconAdd className="h-8 w-8 text-slate-50" />}
                    onClick={() => setOpenDialog(!openDialog)}
                />
                <CustomIcon
                    icon={
                        <IconAccountCircle className="h-8 w-8 text-slate-50" />
                    }
                    onClick={() => setOpen(!open)}
                />
                <SwipeableDrawer
                    anchor="left"
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                >
                    <Menu />
                </SwipeableDrawer>
            </nav>
            <SwipeableDrawer
                open={openDialog}
                anchor="bottom"
                onOpen={() => setOpenDialog(true)}
                onClose={() => setOpenDialog(false)}
            >
                <Box className="bg-[#111B21] h-[70vh] rounded-lg">
                    <SquealCreator />
                </Box>
            </SwipeableDrawer>
            <SwipeableDrawer
                open={openSearch}
                anchor="top"
                onOpen={() => setOpenSearch(true)}
                onClose={() => setOpenSearch(false)}
            >
                <Box className="bg-[#111B21] text-slate-50 flex flex-column">
                    <Searchbar />
                </Box>
            </SwipeableDrawer>
        </>
    );
};

export default Navbar;
