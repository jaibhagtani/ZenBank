import { TransferButton } from "@/components/transferButton";
import React, { JSX } from "react";

export default function TransferLayout({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <div className="max-w-screen">
        <h1 className="mt-14 p-6 max-w-6xl mx-auto rounded-lg text-3xl font-bold mb-8 text-blue-800">
            MPIN
         </h1>

            <div className="grid lg:grid-cols-4 gap-4 pt-5">
                <div className="col-span-1 col-start-2">
                    <TransferButton placeholder="SET" path="/mpin/set" />
                </div>
                <div className="col-span-1 col-start-3">
                    <TransferButton placeholder="UPDATE" path="/mpin/update" />
                </div>
            </div>
            
            <div className="my-8">{children}</div>
        </div>
    );
}
