"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Repeat, User, Lock, Menu, X
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const links = [
    { name: "Home", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Create Account", href: "/create-account", icon: <Repeat className="w-5 h-5" /> },
    { name: "Profile", href: "/profile", icon: <User className="w-5 h-5" /> },
    { name: "MPIN", href: "/mpin/update", icon: <Lock className="w-5 h-5" /> },
  ];

  return (
    <>
      <div className="fixed top-4 left-4 z-[100] md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-xl bg-slate-400 shadow hover:bg-blue-100 transition"
        >
          {menuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 md:z-auto h-screen w-64 bg-slate-200 border-r border-gray-300 p-6 
        transform transition-transform duration-300 ease-in-out
        ${menuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:block`}
      >
        <div className="mt-12 flex flex-col justify-between h-full overflow-y-auto">
          <div>
            <nav className="flex flex-col gap-2">
              {links.map(link => (
                <Link key={link.name} href={link.href} onClick={() => setMenuOpen(false)}>
                  <span className={`flex items-center gap-3 p-3 rounded-lg transition
                    ${pathname === link.href
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : "text-gray-800 hover:bg-blue-50"}`}>
                    {link.icon}
                    {link.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="text-sm text-gray-500 mt-6">
            &copy; 2025 ZenBank
          </div>
        </div>
      </aside>
    </>
  );
}
