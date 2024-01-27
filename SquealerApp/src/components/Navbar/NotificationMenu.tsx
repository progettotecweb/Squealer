"use client";

import { useUser } from "@/hooks/useUser";

const howMuchTimeAgo = (then: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
        // less than an hour
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
        // less than a day
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 604800) {
        // less than a week
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
        // more than a week
        return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    }
};

export default function NotificationMenu() {
    const { user, status, isLoading } = useUser();

    if (status === "unauthenticated") return <div>You need to log in!</div>;

    if (isLoading) return <div className="text-gray-50">Loading...</div>;

    //sort array into three different arrays: today, this week, this month
    //sort array into three different arrays: today, this week, this month
    const today: any[] = [];
    const thisWeek: any[] = [];
    const thisMonth: any[] = [];

    const notifications = user?.notifications;

    if (notifications) {
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
                notif.ago = howMuchTimeAgo(then);
                today.push(notif);
            } else if (days_difference < 7) {
                notif.ago = howMuchTimeAgo(then);
                thisWeek.push(notif);
            } else if (days_difference < 30) {
                notif.ago = howMuchTimeAgo(then);
                thisMonth.push(notif);
            }
        }
    }

    return (
        <div className="flex flex-col">
            <h1 className="text-2xl mb-2">Notifications</h1>
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
            {today.length === 0 &&
                thisWeek.length === 0 &&
                thisMonth.length === 0 && (
                    <div className="text-md text-gray-400">
                        You have no notifications!
                    </div>
                )
            }
        </div>
    );
}

const Notification = ({ notif }: any) => (
    <div className="flex flex-row gap-2 p-2 items-center">
        <img
            src={`/api/media/${notif.author?.img}`}
            alt="Profile Picture"
            className="w-8 h-8 rounded-full object-cover"
        />
        <p className="text-sm">{notif.text}</p>
        <p className="text-sm text-gray-400 ml-auto">{notif.ago}</p>
    </div>
);
