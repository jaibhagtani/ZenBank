"use client";
import { JSX, useState } from "react";
import { Button } from "./button";

interface AppbarProps {
  user?: {
    name?: string | null;
  };
  onSignin: () => void;
  onSignout: () => void;
}

export function AppBar({
  user,
  onSignin,
  onSignout,
}: AppbarProps): JSX.Element {
  const [downAccountBar, setDownAccountBar] = useState(false);

  let initials = "";
  if (user?.name) {
    const nameParts = user.name.trim().split(/\s+/);
    initials = nameParts
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            ZenBank
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {user && (
            <div
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/30 text-white text-lg font-bold hover:bg-white/40 cursor-pointer transition"
              onClick={() => setDownAccountBar(!downAccountBar)}
            >
              {initials}
            </div>
          )}

          <Button
            onClickFunc={user ? onSignout : onSignin}
            className="bg-white text-blue-600 hover:bg-blue-50 border border-white/30 shadow-sm rounded-full px-4 py-2 flex items-center space-x-2 transition"
          >
            {user ? (
              <>
                <LogOutIcon />
                <span className="hidden sm:inline">Log Out</span>
              </>
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LogOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h4a2 2 0 002-2V5a2 2 0 00-2-2H3" />
    </svg>
  );
}
