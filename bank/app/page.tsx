import { NEXT_AUTH } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";


export default async function Page()
{
    const session = await getServerSession(NEXT_AUTH);
    
    // console.log(session);
    if(!session?.user?.email) 
    {   
        redirect("/auth/signin")
    }
    else 
    {
        redirect("/dashboard")
    }
    return (
        <div>
            Page 
        </div>
    )
}