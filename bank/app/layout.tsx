import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body
          className="mt-14 bg-slate-100"
        >
            <div className="flex-auto">
              {children}
            </div>
        </body>
      </Providers>
    </html>
  );
}
