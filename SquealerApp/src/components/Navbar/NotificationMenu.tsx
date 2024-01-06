"use client";

import { useUser } from "@/hooks/useUser";

export default function NotificationMenu() {
    const { user, status, isLoading } = useUser();

    if (status === "unauthenticated") return <div>You need to log in!</div>;

    if (isLoading) return <div className="text-gray-50">Loading...</div>;

    //sort array into three different arrays: today, this week, this month
    //sort array into three different arrays: today, this week, this month
    const today: any[] = [];
    const thisWeek: any[] = [];
    const thisMonth: any[] = [];

    const notifications = user.notifications;

    for (let i = 0; i < notifications.length; i++) {
        const notif = notifications[i];

        if (notif.createdAt === null) continue;

        //get time difference from now
        const now = new Date();
        const then = new Date(notif.createdAt);

        var time_difference = now.getTime() - then.getTime();

        //calculate days difference by dividing total milliseconds in a day
        var days_difference = time_difference / (1000 * 60 * 60 * 24);

        if (days_difference < 1) {
            today.push(notif);
        } else if (days_difference < 7) {
            thisWeek.push(notif);
        } else if (days_difference < 30) {
            thisMonth.push(notif);
        }
    }

    return (
        <div className="flex flex-col">
            <h1 className="text-lg">Notifications</h1>
            {today.length > 0 && (
                <div className="flex flex-col">
                    <h2 className="text-md">Today</h2>
                    {today.reverse().map((notif, index) => (
                        <Notification notif={notif} key={index} />
                    ))}
                </div>
            )}
            {thisWeek.length > 0 && (
                <div className="flex flex-col">
                    <h2 className="text-md">This Week</h2>
                    {thisWeek.reverse().map((notif, index) => (
                        <Notification notif={notif} key={index} />
                    ))}
                </div>
            )}
            {thisMonth.length > 0 && (
                <div className="flex flex-col">
                    <h2 className="text-md">This Month</h2>
                    {thisMonth.reverse().map((notif, index) => (
                        <Notification notif={notif} key={index} />
                    ))}
                </div>
            )}
        </div>
    );
}

const Notification = ({ notif }: any) => (
    <div className="flex flex-row gap-2 p-2 items-center">
        <img
            src={`data:${notif.author?.img.mimetype};base64,${notif.author?.img.blob}`}
            alt="Profile Picture"
            className="w-8 h-8 rounded-full object-cover"
        />
        <p className="text-sm">{notif.text}</p>

        {/* <p className="text-xs">{notif.createdAt}</p> */}
    </div>
);
