import { AppBarClient } from "@/components/addbarClient";
import Sidebar from "@/components/sideBar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppBarClient></AppBarClient>
      <div className="mt-2 flex overflow-auto">
        <Sidebar />
        <div className="mt-8 flex-auto bg-slate-100">
          {children}
        </div>
      </div>
    </>
  );
}
