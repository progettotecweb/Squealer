import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
    const { username } = await req.json();

    return Response.json({ message: "Hello " + username });
}
