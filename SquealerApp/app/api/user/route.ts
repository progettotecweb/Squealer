import authOptions from "@/auth";
import { getServerSession } from "next-auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if(session)
        return Response.json(session?.user)

    else
        return Response.json({error: "you need to log in"})
}

// fetch("/Home/api/user", {method: "GET", headers: {"Content-Type": "application/json"}}).then(res => res.json()).then(data => {console.log(data))