import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react"

const useUser = () => {
    const {data: session, status} = useSession();

    return {user: session?.user, status};
}

const useServerUser = async () => {
    const session = await getServerSession();
    return {user: session?.user};
}

export {useUser, useServerUser}