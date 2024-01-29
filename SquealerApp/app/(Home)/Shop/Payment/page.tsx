"use client";

import PageContainer from "@/components/PageContainer";

import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useSWRConfig } from "swr";

export default function FakePaymentPage() {
    const searchParams = useSearchParams();
    const { data: session, status, update } = useSession();
    const { mutate } = useSWRConfig();

    const search = `your ${searchParams?.get("q")}` || "";
    const red = searchParams?.get("r") || "/";
    const id = searchParams?.get("id") || "";

    const steps = [
        {
            title: "Order confirmed!",
            description: "Thank you for your purchase.",
        },
        {
            title: "Processing your payment...",
            description: "This may take a few seconds.",
        },
        {
            title: "Payment complete!",
            description: "Hurray!",
        },
        {
            title: `Preparing your ${search.toLowerCase()}...`,
            description: "This may take a few seconds...",
        },
        {
            title: "Redirecting...",
            description: "You will be redirected in a few seconds.",
        },
    ];

    const [progress, setProgress] = useState(0);

    const currentStep = useRef(0);

    const advance = () => {
        if (currentStep.current >= steps.length - 1) return;
        currentStep.current += 1;
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    redirect(red);
                }
                const diff = Math.random() * 10;
                if (
                    Math.floor(Math.floor(oldProgress + diff) / 22) >
                    currentStep.current
                )
                    advance();
                return Math.min(oldProgress + diff, 100);
            });
        }, 250);

        return () => {
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (session) {
            fetch(`/api/shop/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    user: session?.user?.id,
                    type: search,
                }),
            }).then((res) => {
                
            });
        }

        return () => {
            update();
            mutate(`/api/users/${session?.user?.id}`);
        }
    }, []);

    return (
        <PageContainer
            className="flex flex-col items-center justify-center h-[80vh] gap-4"
            key="fake-payment"
        >
            <h1 className="text-4xl font-bold">
                Processing order for {search.toLowerCase()}...
            </h1>
            <Step step={steps[currentStep.current]?.title}>
                {steps[currentStep.current]?.description}
            </Step>
            <motion.div className="h-4 bg-gray-500 w-[60%] rounded-md" layout>
                <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-md"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    layout
                />
            </motion.div>
        </PageContainer>
    );
}

const Step = ({ step, children }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">{step}</h1>
            <p className="text-xl text-gray-500">{children}</p>
        </div>
    );
};
