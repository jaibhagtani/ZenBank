import { NEXT_AUTH } from "@/lib/auth";
import { prisma } from "../../../../db";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {

    const session = await getServerSession(NEXT_AUTH);
    if(!session)
    {
        return Response.json({
            msg : "User not Loggedin!"
        },
        {
            status: 404
        })
    }


    try {
        
        const { Mpin, email } = await request.json();
        const userRecord = await prisma.user.findFirst({
            where: {
                email: email
            },
            select: {
                MPIN: true
            }
        });

            if (!userRecord || !userRecord.MPIN) {
                return Response.json(
                { msg: "MPIN not set for this user" },
                { status: 400 }
                );
            }
            const result = await bcrypt.compare(Mpin, userRecord.MPIN);

            if(result)
            {
                return Response.json({
                    msg: "Valid User"
                })
            }
            else 
            {
                return Response.json({
                    msg: "Invalid User"
                },
                {
                    status: 400
                })
            }
    }
    catch(e) {
        console.error(e)
        return Response.json({
            msg: "Something went Wrong!!"
        },
        {
            status:500
        })
    }
}

    
