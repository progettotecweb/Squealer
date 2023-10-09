"use server";

import authOptions from "@/auth"
import { getServerSession } from "next-auth"
import type { NextApiRequest, NextApiResponse } from 'next'

/** 
*/


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(authOptions);

    if(session) {
        res.status(200).json(session.user)
    } else {
        res.status(404).json({error: "You need to log in"})
    }
}