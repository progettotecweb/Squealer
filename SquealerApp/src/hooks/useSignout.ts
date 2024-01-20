"use client";

import { signOut } from "next-auth/react";

const useSignout = () => {
    const handleSignout = async () => {
        // Clear user related data from local storage
        window.localStorage.removeItem("recents");

        // Unsubscribe from push notifications
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));

        // Finally sign out
        await signOut({
            callbackUrl: "/Home/Login",
        });
    };

    return handleSignout;
};

export default useSignout;
