"use client"
import { SessionProvider } from "next-auth/react";
import React from "react";


export default function Providers({children} : {children : React.ReactElement})
{
    return (
        <>
            <SessionProvider>
            {children}
            </SessionProvider>
        </>
    )
}