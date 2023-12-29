import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react"
import useSWR from "swr";

const useUser = () => {
    const {data: session, status} = useSession();

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const {data, isLoading} = useSWR(session ? `/api/users/${session.user.id}` : null, fetcher);

    return {user: data, status, isLoading};
}

const useServerUser = async () => {
    const session = await getServerSession();
    return {user: session?.user};
}

export {useUser, useServerUser}