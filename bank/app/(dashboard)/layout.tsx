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
      <div className="flex overflow-auto">
        <Sidebar />
        <div className="flex-auto">
          {children}
        </div>
      </div>
    </>
  );
}
