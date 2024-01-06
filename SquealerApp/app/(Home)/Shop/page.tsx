"use client";

import PageContainer from "@/components/PageContainer";
import { motion } from "framer-motion";

interface ShopItemProps {
    title: string;
    description: string;
    price: string | number;
    vip?: boolean;
}

const ShopItem = ({ title, description, price, vip }: ShopItemProps) => {
    const vipVariants = vip
        ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
        : "bg-gray-50";

    return (
        <motion.div
            className={`w-full rounded-lg ${vipVariants}  p-1`}
            whileHover={{ scale: 1.05 }}
        >
            <div className="rounded-lg p-4 flex flex-col items-start bg-[#111B21] h-full gap-2">
                <h1 className="text-xl">{title}</h1>
                <p className="text-left">{description}</p>
                <button className="border border-slate-50 rounded-md p-2 mt-auto px-10">
                    ${price}
                </button>
            </div>
        </motion.div>
    );
};

const shopItems = [
    {
        title: "Vip Subscription",
        description:
            "Buy a subscription to get access to the VIP section of the site!",
        price: "5.99/Month",
    },
    {
        title: "Daily characters",
        description:
            "Finished your daily characters? Buy more here! (250 daily characters)",
        price: 1.99,
    },
    {
        title: "Weekly characters",
        description:
            "Finished your weekly characters? Buy more here! (1000 weekly characters)",
        price: 3.99,
    },
    {
        title: "Monthly characters",
        description:
            "Finished your monthly characters? Buy more here! (5000 monthly characters)",
        price: 5.99,
    },
    {
        title: "Private channel",
        description:
            "Buy your own private channel! (billed monthly based on usage)",
        price: "0.99/ 100 squeals",
    },
];

const ShopPage = () => {
    return (
        <PageContainer key="shop" className="gap-4">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                {shopItems.map((item, index) => (
                    <ShopItem
                        key={index}
                        title={item.title}
                        description={item.description}
                        price={item.price}
                        vip={index === 0}
                    />
                ))}
            </section>
        </PageContainer>
    );
};

export default ShopPage;
