import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import { NEXT_AUTH } from "@/lib/auth";

// This Api route shows is user logged in or not 

export async function GET(req: NextApiRequest, res: NextApiResponse) {
        const session = await getServerSession(NEXT_AUTH);

    if(session?.user)
    {
        return NextResponse.json({
            msg: session.user
        })
    }
    
    return NextResponse.json({
        msg: "You are not logged in"
    },
    {
        status: 403
    })
}

