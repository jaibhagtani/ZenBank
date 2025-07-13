import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body
          className="bg-blue-300"
        >
            <div className="flex-auto">
              {children}
            </div>
        </body>
      </Providers>
    </html>
  );
}
