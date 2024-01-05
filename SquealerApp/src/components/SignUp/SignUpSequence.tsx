"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const InputClassNames = "rounded-md p-2 bg-gray-800 mb-4";

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

const SignUpSequenceError = (props: { error: string }) => {
    return (
        <AnimatePresence mode="popLayout">
            {props.error && (
                <motion.h1
                    className="text-red-500 text-center w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {props.error}
                </motion.h1>
            )}
        </AnimatePresence>
    );
};

const SignUpSequence = () => {
    const [error, setError] = useState("");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rPassword, setRPassword] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [amI18OrOlder, setAmI18OrOlder] = useState(false);

    const [bio, setBio] = useState("");
    const [img, setImg] = useState("");

    const [step, setStep] = useState(1);

    const router = useRouter();

    const handleCapture = (img: string) => {
        console.log(img);
        setImg(img);
    };

    const handleContent = async (e: any) => {
        if (!e.target.files[0].type.startsWith("image")) {
            alert("File must be an image");
        } else {
            await handleImg(e.target);
        }
    };

    const handleImg = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const imgDataUrl = reader.result as string;
                setImg(imgDataUrl);
                resolve(imgDataUrl); // resolve promise
            };

            reader.onerror = (error) => {
                reject(error); // reject promise if something goes wrong
            };

            reader.readAsDataURL(file.files[0]);
        });
    };

    const requestFirstStep = async (e) => {
        e.preventDefault();

        // first pass input validation; check if all fields are filled, if passwords match.
        // Second control will be done server side

        if (!username || !password || !rPassword) {
            handleError("Please fill all fields!");
            return;
        }

        if (!agreeTerms) {
            handleError("Please agree to the terms and conditions!");
            return;
        }

        if (!amI18OrOlder) {
            handleError("You must be 18 or older to use this app!");
            return;
        }

        if (username.length < 5) {
            handleError("Username must be at least 5 characters long!");
            return;
        }

        if (password.length < 8) {
            handleError("Password must be at least 8 characters long!");
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/g;
        if (!usernameRegex.test(username)) {
            handleError(
                "Username may contain only letters, numbers, a dot or an underscore!"
            );
            return;
        }

        if (password !== rPassword) {
            handleError("Passwords do not match!");
            return;
        }

        advance();
    };

    const advance = () => {
        setStep(step + 1);
    };

    const resetAll = () => {
        setStep(1);

        setUsername("");
        setPassword("");
        setRPassword("");
        setImg("");
        setBio("");
    };

    const requestLogin = async (e) => {
        e.preventDefault();

        await signIn("login", {
            username,
            password,
            redirect: false,
        }).then((data) => {
            data?.error
                ? setError("Credentials do not match!")
                : router.push("/");
        });
    };

    const requestSecondStep = async (e) => {
        e.preventDefault();

        console.log("Sign up request: ", {
            username,
            password,
            bio,
            img: formatImg(img),
        });

        await fetch("/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
                bio,
                img: formatImg(img),
            }),
        }).then((res) => {
            if (res.ok) {
                requestLogin(e);
            } else {
                setError("User already exists!");
            }
        });
    };

    const formatImg = (img: string | null) => {
        if (!img) {
            console.log("no img");
            return null;
        }
        let myImg = { mimetype: "", blob: "" };
        const imgSplit = img.split(",");
        const imgType = imgSplit[0].split(";")[0].split(":")[1];
        const imgBlob = imgSplit[1];
        myImg = { mimetype: imgType, blob: imgBlob };

        return myImg;
    };

    const handleError = (error: string) => {
        setError(error);
        setTimeout(() => {
            setError("");
        }, 3000);
    };

    return (
        <motion.div className="flex flex-col items-center gap-2">
            <motion.div layout animate={"height"}>
                <img src="/squealer.png" alt="logo" />
                <motion.h1 className="text-xl">Join Squealer</motion.h1>
            </motion.div>
            <AnimatePresence mode="popLayout">
                {step === 1 ? (
                    <motion.div
                        variants={fadeInFromRight}
                        initial="initial"
                        exit="exit"
                        animate="animate"
                        key="step1"
                        layout
                    >
                        <form className="flex flex-col items-start">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={InputClassNames}
                            />
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={InputClassNames}
                            />
                            <label htmlFor="r-password">Repeat Password</label>
                            <input
                                type="password"
                                id="r-password"
                                value={rPassword}
                                onChange={(e) => setRPassword(e.target.value)}
                                className={InputClassNames}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) =>
                                        setAgreeTerms(e.target.checked)
                                    }
                                    id="agreeTerms"
                                />
                                <label htmlFor="agreeTerms">
                                    I agree to the terms and conditions
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="checkbox"
                                    checked={amI18OrOlder}
                                    onChange={(e) =>
                                        setAmI18OrOlder(e.target.checked)
                                    }
                                    id="amI18OrOlder"
                                />
                                <label htmlFor="amI18OrOlder">
                                    I am 18 or older
                                </label>
                            </div>
                        </form>
                        <button
                            className="py-2 px-8 bg-gray-700 rounded-md"
                            onClick={requestFirstStep}
                        >
                            <span>Continue</span>
                        </button>
                    </motion.div>
                ) : (
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
                        <div>
                            <div className="flex ">
                                {/* <Camera onCapture={handleCapture} /> */}
                                <div className="rounded-full bg-gray-800 w-24 h-24 overflow-hidden">
                                    {!img ? (
                                        <AccountCircleIcon className="w-10 h-10" />
                                    ) : (
                                        <img
                                            className="object-cover rounded-full w-24 h-24 object-center"
                                            src={img}
                                        />
                                    )}
                                </div>
                            </div>
                            <p className="mt-4 mb-4">OR</p>
                            <input
                                className="md:h-[10vh]"
                                accept="image/*"
                                id="icon-button-file"
                                type="file"
                                capture="environment"
                                onChange={(e) => {
                                    handleContent(e);
                                }}
                            />
                        </div>
                        <label htmlFor="bio">Tell us more about yourself</label>
                        <form>
                            <textarea
                                className={`${InputClassNames}`}
                                rows={4}
                                placeholder="Bio..."
                                value={bio}
                                onChange={(e) => {
                                    setBio(e.target.value);
                                }}
                                id="bio"
                                maxLength={150}
                            />
                        </form>
                        <div className="flex w-full gap-2 justify-center">
                            <button
                                className="py-2 px-8 bg-gray-700 rounded-md"
                                onClick={requestSecondStep}
                            >
                                Skip
                            </button>
                            <button
                                className="py-2 px-8 bg-blue-700 rounded-md"
                                onClick={requestSecondStep}
                            >
                                Sign up
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setStep(1);
                            }}
                        >
                            Go back
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div layout>
                <SignUpSequenceError error={error} />
            </motion.div>

            <motion.div layout>
                <button
                    className="text-blue-700"
                    onClick={() => {
                        router.push("/Login");
                    }}
                >
                    Already have an account?
                </button>
            </motion.div>
        </motion.div>
    );
};

export default SignUpSequence;
