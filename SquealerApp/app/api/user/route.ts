import authOptions from "@/auth";
import { getServerSession } from "next-auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if(session)
        return Response.json(session?.user)

    else
        return Response.json({error: "you need to log in"})
} 