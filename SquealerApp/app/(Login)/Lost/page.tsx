"use client";

import PageContainer from "@/components/PageContainer";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DevicesIcon from "@mui/icons-material/Devices";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// the user can choose to reset with another device where they are logged in
// or they can reset with email (fake loading screen)

interface Step {
    name: string;
    back: string | null;
    forward: string[] | null;
    additional?: string | null;
}

const steps = {
    base: {
        name: "base",
        back: null,
        forward: ["device1", "email1"],
    },
    device1: {
        name: "device1",
        back: "base",
        forward: ["device2"],
    },
    device2: {
        name: "device2",
        back: "device1",
        forward: ["final"],
        additional: null,
    },
    email1: {
        name: "email1",
        back: "base",
        forward: ["email2"],
    },
    email2: {
        name: "email2",
        back: "email1",
        forward: ["final"],
    },
    final: {
        name: "final",
        back: null,
        forward: null,
    },
};

const Message = (props: { message: string; isOk: boolean }) => {
    return (
        <AnimatePresence mode="popLayout">
            {props.message && (
                <motion.h1
                    className={`${
                        !props.isOk && "text-red-500"
                    } text-center w-full`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {props.message}
                </motion.h1>
            )}
        </AnimatePresence>
    );
};

export default function LostPage() {
    const [step, setStep_] = useState<Step>(steps["base"]);
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState({ message: "", isOk: false });

    const displayMessage = (message: string, isOk: boolean) => {
        setMessage({ message, isOk });
    };

    const setStep = (stepName: string, additional: string | null = null) => {
        setStep_({ ...steps[stepName], additional });
    };

    const handleNotification = async () => {
        await fetch("/api/users/password-reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    setStep("device2", res.code);
                }

                displayMessage(res.message, res.ok);
            });
    };

    const verifyWithCode = async () => {
        await fetch("/api/users/password-reset/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code, username: username }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    setStep("final", username);
                }

                displayMessage(res.message, res.ok);
            });
    };

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const resetPassword = async () => {
        if (password.length < 8) {
            displayMessage(
                "Password must be at least 8 characters long",
                false
            );
            return;
        }
        if (password !== confirmPassword) {
            displayMessage("Passwords do not match", false);
            return;
        }

        await fetch("/api/users/password-reset/reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
                confirmPassword: confirmPassword,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    router.push("/Login");
                }

                displayMessage(res.message, res.ok);
            });
    };

    useEffect(() => {
        // make message disappear after 3 seconds
        if (message.message) {
            setTimeout(() => {
                setMessage({ message: "", isOk: false });
            }, 3000);
        }
    }, [message])

    const router = useRouter();

    return (
        <PageContainer className="h-[100vh]">
            <motion.div className="flex flex-col items-center gap-2">
                <motion.div layout animate={"height"}>
                    <img src="/squealer.png" alt="logo" />
                    <motion.h1 className="text-xl">
                        Forgot your password?
                    </motion.h1>
                </motion.div>
                <AnimatePresence mode="popLayout">
                    {step.name === "base" ? (
                        <motion.div
                            variants={fadeInFromRight}
                            initial="initial"
                            exit="exit"
                            animate="animate"
                            key="step1"
                            layout
                            className="flex flex-col gap-2 items-center"
                        >
                            <button
                                onClick={() => setStep("device1")}
                                className="w-full flex items-center gap-2 px-8 py-2 hover:bg-gray-700 rounded-md transition-colors"
                            >
                                <DevicesIcon />
                                <p>
                                    Use another device where you are logged in
                                </p>
                            </button>
                            <button
                                onClick={() => setStep("email1")}
                                className="w-full flex items-center gap-2 px-8 py-2 hover:bg-gray-700 rounded-md transition-colors"
                            >
                                <AdminPanelSettingsOutlinedIcon />
                                <p>Contact the moderators</p>
                            </button>
                        </motion.div>
                    ) : step.name === "device1" ? (
                        <motion.div
                            className="flex flex-col gap-2 w-full"
                            variants={fadeInFromRight}
                            initial="initial"
                            exit="exit"
                            animate="animate"
                            key="step2"
                            layout
                            layoutId="step1"
                        >
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Username"
                                className="rounded-md p-2 bg-gray-800 mb-4"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <button
                                className=" px-8 py-2 hover:bg-gray-700 rounded-md transition-colors"
                                onClick={() => handleNotification()}
                            >
                                Send notification
                            </button>
                        </motion.div>
                    ) : step.name === "device2" ? (
                        <motion.div
                            className="flex flex-col gap-2 w-full"
                            variants={fadeInFromRight}
                            initial="initial"
                            exit="exit"
                            animate="animate"
                            key="step3"
                            layout
                            layoutId="step1"
                        >
                            {step.additional}
                            <p>
                                Enter the code sent to your device
                                <span>(Expires in seconds)</span>
                            </p>
                            <input
                                id="code"
                                type="text"
                                placeholder="Code"
                                className="rounded-md p-2 bg-gray-800 mb-4"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <button
                                className=" px-8 py-2 hover:bg-gray-700 rounded-md transition-colors"
                                onClick={() => verifyWithCode()}
                            >
                                Verify
                            </button>
                        </motion.div>
                    ) : step.name === "email1" ? (
                        <motion.div
                            className="flex flex-col gap-2 w-full"
                            variants={fadeInFromRight}
                            initial="initial"
                            exit="exit"
                            animate="animate"
                            key="step3"
                            layout
                            layoutId="step1"
                        >
                            <p>
                                Contact the moderators at 
                                <span className="text-blue-500 hover:text-blue-600 transition-colors">
                                    <a href="mailto:moderators@squealer.com

                                    "> moderators@squealer.com</a>
                                </span>
                            </p>
                            <p>
                                or send a message using the form below
                            </p>
                            <div className="flex flex-col gap-2 items-start w-full">
                                <label htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Username"
                                    className="rounded-md p-2 bg-gray-800 mb-4 w-full"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    placeholder="Message"
                                    rows={4}
                                    className="rounded-md p-2 bg-gray-800 mb-4 resize-none w-full"
                                />
                                <button
                                    className=" px-8 py-2 hover:bg-gray-700 bg-gray-800 rounded-md transition-colors"
                                    onClick={() => displayMessage("OOOPSSS we were lazy this time...", false)}
                                >
                                    Send
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        step.name === "final" && (
                            <motion.div
                                className="flex flex-col gap-2 w-full"
                                variants={fadeInFromRight}
                                initial="initial"
                                exit="exit"
                                animate="animate"
                                key="final"
                                layout
                                layoutId="step1"
                            >
                                <p>Reset password for {step.additional}</p>

                                <form className="flex flex-col gap-2 items-start">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="rounded-md p-2 bg-gray-800 mb-4"
                                    />
                                    <label htmlFor="confirm-pwd">
                                        Confirm password
                                    </label>
                                    <input
                                        id="confirm-pwd"
                                        type="password"
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        className="rounded-md p-2 bg-gray-800 mb-4"
                                    />
                                    <button
                                        className=" px-8 py-2 hover:bg-gray-700 bg-gray-800 self-center rounded-md transition-colors"
                                        onClick={() => resetPassword()}
                                    >
                                        Reset
                                    </button>
                                </form>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>

                <motion.div layout>
                    <Message message={message.message} isOk={message.isOk} />
                </motion.div>

                <motion.div layout>
                    <button
                        onClick={() => {
                            step.back
                                ? setStep(step.back)
                                : router.push("/Login");
                        }}
                        className="flex items-center gap-2 px-8 py-2 hover:bg-gray-700 rounded-md transition-colors"
                    >
                        <ArrowBackIcon />
                        Go back
                    </button>
                </motion.div>
            </motion.div>
        </PageContainer>
    );
}

const Step = (props: { children: React.ReactNode; name?: string }) => (
    <motion.div
        className="flex flex-col gap-2 w-full"
        variants={fadeInFromRight}
        initial="initial"
        exit="exit"
        animate="animate"
        layoutId={props.name}
        key={props.name}
        layout
    >
        {props.children}
    </motion.div>
);

const fadeInFromRight = {
    initial: {
        x: 100,
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
    },
    exit: {
        x: -100,
        opacity: 0,
    },
};
