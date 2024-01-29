"use client";

import CustomLink from "@/components/CustomLink";
import PageContainer from "@/components/PageContainer";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Link from "next/link";

interface ShopItemProps {
    title: string;
    description: string;
    price: string | number;
    vip?: boolean;
    redirect?: string;
    id?: string;
    session?: any;
}

const ShopItem = ({
    title,
    description,
    price,
    vip,
    redirect,
    id,
    session,
}: ShopItemProps) => {
    const vipVariants = vip
        ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
        : "bg-gray-50";

    const isVip = ["Pro", "Mod"].includes(session?.user?.role);

    return (
        <motion.div
            className={`w-full rounded-lg ${vipVariants} relative  p-1 ${
                vip && isVip ? "hidden" : "cursor-pointer"
            } `}
            whileHover={{ scale: 1.05 }}
        >
            <div
                className={
                    "rounded-lg p-4 flex flex-col items-start bg-[#111B21] h-full gap-2 "
                }
            >
                <h1 className="text-xl">{title}</h1>
                <p className="text-left">{description}</p>
                <Link
                    href={`/Shop/Payment?q=${title}&r=${redirect}&id=${id}`}
                    className="border border-slate-50 rounded-md p-2 mt-auto px-10"
                >
                    ${price}
                </Link>
            </div>
            {!isVip && !vip && (
                <motion.div
                    whileHover={{ opacity: 1 }}
                    className="opacity-80 z-10 absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 rounded-lg"
                >
                    <h1 className="text-2xl font-bold text-white">
                        <LockOutlinedIcon className="w-10 h-10" />
                    </h1>
                </motion.div>
            )}
        </motion.div>
    );
};

const shopItems = [
    {
        title: "250 daily characters",
        to: "/",
        description:
            "Finished your daily characters? Buy more here! (250 daily characters)",
        price: 1.99,
        id: "daily",
    },
    {
        title: "1000 weekly characters",
        to: "/",
        description:
            "Finished your weekly characters? Buy more here! (1000 weekly characters)",
        price: 3.99,
        id: "weekly",
    },
    {
        title: "5000 monthly characters",
        to: "/",
        description:
            "Finished your monthly characters? Buy more here! (5000 monthly characters)",
        price: 5.99,
        id: "monthly",
    },
    {
        title: "Maxi package!",
        to: "/",
        description:
            "Finished all your characters? Buy more here! (250 daily, 1000 weekly, 5000 monthly characters)",
        price: 9.99,
        id: "maxi",
    },
    {
        title: "Private channel",
        to: "/Shop/CreateChannel",
        description:
            "Buy your own private channel! (billed monthly based on usage)",
        price: "0.99/ 100 squeals",
        id: "private-channel",
    },
];

const ShopPage = () => {
    const { data: session, status } = useSession();

    if (status === "loading") return <div>Loading...</div>;

    if (status === "authenticated")
        return (
            <PageContainer key="shop" className="gap-4 mb-[4rem] p-4">
                <motion.div className=" flex flex-col gap-4 w-full sm:w-[60vw] text-start">
                    <h1 className="text-2xl sm:text-4xl font-bold">Shop</h1>
                    <p className="text-xl text-start">
                        Buy more characters, or your own private channel!
                        {!["Pro", "Mod"].includes(session?.user?.role) && <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-start text-white opacity-0 "
                        >
                            You need to have a professional account to buy items in the shop.
                        </motion.span>}
                    </p>
                    <ShopItem
                        title="Professional Account"
                        description="Get access to the vip lounge!"
                        price="5.99"
                        vip
                        redirect="/Shop"
                        id="vip"
                        session={session}
                    />
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                        {shopItems.map((item, index) => (
                            <ShopItem
                                key={index}
                                title={item.title}
                                description={item.description}
                                price={item.price}
                                redirect={item.to}
                                id={item.id}
                                session={session}
                            />
                        ))}
                    </section>
                </motion.div>
            </PageContainer>
        );
};

export default ShopPage;
