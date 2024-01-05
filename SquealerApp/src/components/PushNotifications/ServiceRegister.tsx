"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

const publicVapidKey =
    "BKd0FOnmkngVtRSf7N3ogMcnnDQGtu5PSMcbzmt_uvrcDTpL424TE6W92qpnMGZPeh1XqHi1rA_MT0iUL0gBXuY";

const notificationsSupported = () =>
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

const registerServiceWorker = async () => {
    return navigator.serviceWorker.register("/service.js");
};

const unregisterServiceWorkers = async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
};

const subscribe = async (user: string) => {
    //await unregisterServiceWorkers()

    const swRegistration = await registerServiceWorker();
    await window?.Notification.requestPermission();

    try {
        const options = {
            applicationServerKey: publicVapidKey,
            userVisibleOnly: true,
        };
        const subscription = await swRegistration.pushManager.subscribe(
            options
        );

        await saveSubscription(subscription, user);

        console.log({ subscription });
    } catch (err) {
        console.error("Error", err);
    }
};

const saveSubscription = async (
    subscription: PushSubscription,
    user: string
) => {
    const ORIGIN = window.location.origin;
    const BACKEND_URL = `${ORIGIN}/api/push`;

    const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription, user }),
    });
    return response.json();
};

const ServiceRegister = () => {
    const { data: session, status } = useSession();

    useEffect(() => {
        (async () => {
            if (status !== "authenticated") return;
            if (!notificationsSupported()) return;
            subscribe(session.user.name);
        })();
    }, [status]);

    if (!notificationsSupported()) {
        return (
            <div className="text-gray-50">
                Error: notifications not supported
            </div>
        );
    }

    return <></>;
};

export default ServiceRegister;
