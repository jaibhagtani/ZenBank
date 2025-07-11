
"use client"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppBar } from "./appbar";

export function AppBarClient() {
    const router = useRouter();
    const session = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    console.log(session)
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            className={`fixed top-0 w-full z-50 transition-shadow duration-300 bg-pink-50 ${
                isScrolled ? "shadow-xl backdrop-blur-xl bg-blue-200/70" : "bg-transparent"
            }`}
        >
            <AppBar
                onSignin={() => {
                    router.push("/auth/signin")
                }}
                onSignout={async () => {
                    await signOut();
                    router.push("/auth/signin");
                }}
                user={session?.data?.user}
            />
        </div>
    )
}